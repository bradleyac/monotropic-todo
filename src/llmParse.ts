import type {
  CognitiveMode as ParserCognitiveMode,
  Context as ParserContext,
  ParsedTask,
} from "../tools/parser/src/types";
import { parseTask } from "../tools/parser/src/parser";
import type { Affinity, Energy, SocialDemand, Task } from "./types";
import type { CognitiveMode as AppCognitiveMode, Context as AppContext } from "./types";
import { placeTask } from "./scheduler";

// The eval-pipeline parser uses a richer mode/context vocabulary than the
// app (split social into sync/async, "at-home" vs the app's "at-home-anywhere",
// etc.). Translate here so the app's scheduler/planner keep working unchanged.

const MODE_MAP: Record<ParserCognitiveMode, AppCognitiveMode> = {
  "deep-thinking": "deep",
  creative: "creative",
  physical: "physical",
  admin: "admin",
  "social-sync": "social",
  "social-async": "social",
};

const CONTEXT_MAP: Record<ParserContext, AppContext> = {
  "at-desk": "at-desk",
  "at-home": "at-home-anywhere",
  "out-and-about": "out-and-about",
  "phone-only": "phone-only",
};

// Heuristics, not signals from the model. The parser doesn't try to estimate
// energy or social demand directly; we derive them from mode + context.
const ENERGY_BY_MODE: Record<ParserCognitiveMode, Energy> = {
  "deep-thinking": "high",
  creative: "high",
  physical: "medium",
  admin: "low",
  "social-sync": "medium",
  "social-async": "low",
};

function socialDemand(mode: ParserCognitiveMode): SocialDemand {
  if (mode === "social-sync") return "live-with-others";
  if (mode === "social-async") return "async-with-others";
  return "solo";
}

const DEFAULT_MINUTES = 20;

export async function llmParseAndPlace(
  input: string,
  existing: Task[],
  today: string,
): Promise<Task> {
  const { task } = await parseTask(input, today);
  return toTask(task, existing, today);
}

function toTask(parsed: ParsedTask, existing: Task[], today: string): Task {
  const affinity: Affinity = {
    mode: MODE_MAP[parsed.cognitiveMode],
    context: CONTEXT_MAP[parsed.context],
    energy: ENERGY_BY_MODE[parsed.cognitiveMode],
    social: socialDemand(parsed.cognitiveMode),
  };

  const draft: Task = {
    id: `t-${crypto.randomUUID().slice(0, 8)}`,
    title: parsed.title,
    estMinutes: parsed.estimatedMinutes ?? DEFAULT_MINUTES,
    affinity,
    done: false,
    scheduledFor: today,
  };

  // A deadline with a time becomes an anchor (`at`); a date-only deadline is
  // a soft due-by. Anchors lock the day; due-bys still let the scheduler
  // choose, just no later than that date.
  if (parsed.deadline) {
    if (parsed.deadline.includes("T")) {
      draft.at = parsed.deadline;
    } else {
      draft.dueBy = parsed.deadline;
    }
  }

  draft.scheduledFor = placeTask(draft, existing, today);
  return draft;
}
