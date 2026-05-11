import type { ParsedTask, RawParsedTask } from "./types";
import { COGNITIVE_MODES } from "./types";
import { TASK_SCHEMA, systemPrompt } from "./prompt";
import { resolveDeadline } from "./dates";

export const DEFAULT_MODEL = "gemma4:26b";

export type ParseResult = {
  task: ParsedTask;
  rawTask: RawParsedTask;
  raw: string;
  latencyMs: number;
};

export type ParseError = {
  kind: "network" | "http" | "json" | "shape";
  message: string;
  raw?: string;
};

// Calls the local Ollama instance via the Vite dev-server proxy at /ollama
// (configured in vite.config.ts). Uses /api/chat with a JSON schema as
// `format` so generation is constrained to valid task JSON.
export async function parseTask(
  input: string,
  today: string,
  model: string = DEFAULT_MODEL,
): Promise<ParseResult> {
  const start = performance.now();
  const body = {
    model,
    messages: [
      { role: "system", content: systemPrompt(today) },
      { role: "user", content: input },
    ],
    format: TASK_SCHEMA,
    stream: false,
    options: { temperature: 0 },
  };

  let response: Response;
  try {
    response = await fetch("/ollama/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw {
      kind: "network",
      message: `Could not reach Ollama. Is it running on localhost:11434? (${(e as Error).message})`,
    } satisfies ParseError;
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw {
      kind: "http",
      message: `Ollama returned ${response.status}: ${text || response.statusText}`,
    } satisfies ParseError;
  }

  const payload = (await response.json()) as { message?: { content?: string } };
  const raw = payload.message?.content ?? "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw {
      kind: "json",
      message: `Model output wasn't valid JSON: ${(e as Error).message}`,
      raw,
    } satisfies ParseError;
  }

  const rawTask = validate(parsed);
  if (!rawTask) {
    throw {
      kind: "shape",
      message: "Model output didn't match the expected shape.",
      raw,
    } satisfies ParseError;
  }

  const task: ParsedTask = {
    title: rawTask.title,
    deadline: resolveDeadline(rawTask.deadline, rawTask.deadlineTime, today),
    cognitiveMode: rawTask.cognitiveMode,
    estimatedMinutes: rawTask.estimatedMinutes,
  };

  return { task, rawTask, raw, latencyMs: performance.now() - start };
}

function validate(x: unknown): RawParsedTask | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  if (typeof o.title !== "string") return null;
  if (o.deadline !== null && typeof o.deadline !== "string") return null;
  if (o.deadlineTime !== null && typeof o.deadlineTime !== "string") return null;
  if (typeof o.cognitiveMode !== "string") return null;
  if (!(COGNITIVE_MODES as readonly string[]).includes(o.cognitiveMode)) return null;
  if (typeof o.estimatedMinutes !== "number" || !Number.isFinite(o.estimatedMinutes)) return null;
  return {
    title: o.title,
    deadline: o.deadline as string | null,
    deadlineTime: o.deadlineTime as string | null,
    cognitiveMode: o.cognitiveMode as RawParsedTask["cognitiveMode"],
    estimatedMinutes: o.estimatedMinutes,
  };
}
