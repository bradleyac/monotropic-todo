import { useState } from "react";
import type { ParsedTask, RawParsedTask } from "../types";
import { parseTask, type ParseError } from "../parser";

type Props = {
  today: string;
  model: string;
};

type Output =
  | { kind: "idle" }
  | { kind: "loading" }
  | {
      kind: "ok";
      task: ParsedTask;
      rawTask: RawParsedTask;
      raw: string;
      latencyMs: number;
    }
  | { kind: "err"; message: string; raw?: string };

export function SingleShot({ today, model }: Props) {
  const [input, setInput] = useState("");
  const [out, setOut] = useState<Output>({ kind: "idle" });
  const [useSchema, setUseSchema] = useState(true);

  async function onParse() {
    if (!input.trim()) return;
    setOut({ kind: "loading" });
    try {
      const r = await parseTask(input.trim(), today, model, useSchema);
      setOut({
        kind: "ok",
        task: r.task,
        rawTask: r.rawTask,
        raw: r.raw,
        latencyMs: r.latencyMs,
      });
    } catch (e) {
      const err = e as ParseError;
      setOut({ kind: "err", message: err.message, raw: err.raw });
    }
  }

  return (
    <section className="single-shot">
      <label className="field">
        <span className="field-label">Task description</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Dentist appointment Tuesday at 3pm"
          rows={3}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onParse();
          }}
        />
      </label>
      <div className="single-shot-controls">
        <button
          className="primary"
          onClick={onParse}
          disabled={out.kind === "loading" || !input.trim()}
        >
          {out.kind === "loading" ? "parsing…" : "parse this task"}
        </button>
        <label className="raw-toggle">
          <input
            type="checkbox"
            checked={useSchema}
            onChange={(e) => setUseSchema(e.target.checked)}
            disabled={out.kind === "loading"}
          />
          <span>constrain with JSON schema</span>
        </label>
      </div>

      {out.kind === "ok" && (
        <div className="output">
          <div className="output-meta">
            <span className="chip">{out.latencyMs.toFixed(0)} ms</span>
          </div>
          <div className="output-section">
            <div className="output-section-label">resolved</div>
            <pre className="output-json">
              {JSON.stringify(out.task, null, 2)}
            </pre>
          </div>
          <div className="output-section">
            <div className="output-section-label">model tokens</div>
            <pre className="output-json output-json-muted">
              {JSON.stringify(out.rawTask, null, 2)}
            </pre>
          </div>
        </div>
      )}
      {out.kind === "err" && (
        <div className="output output-err">
          <div className="err-message">{out.message}</div>
          {out.raw && (
            <details>
              <summary>raw model output</summary>
              <pre>{out.raw}</pre>
            </details>
          )}
        </div>
      )}
    </section>
  );
}
