import { useState } from "react";
import type { ParsedTask } from "../types";
import { parseTask, type ParseError } from "../parser";

type Props = {
  today: string;
  model: string;
};

type Output =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; task: ParsedTask; raw: string; latencyMs: number }
  | { kind: "err"; message: string; raw?: string };

export function SingleShot({ today, model }: Props) {
  const [input, setInput] = useState("");
  const [out, setOut] = useState<Output>({ kind: "idle" });

  async function onParse() {
    if (!input.trim()) return;
    setOut({ kind: "loading" });
    try {
      const r = await parseTask(input.trim(), today, model);
      setOut({ kind: "ok", task: r.task, raw: r.raw, latencyMs: r.latencyMs });
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
      <button
        className="primary"
        onClick={onParse}
        disabled={out.kind === "loading" || !input.trim()}
      >
        {out.kind === "loading" ? "parsing…" : "parse this task"}
      </button>

      {out.kind === "ok" && (
        <div className="output">
          <div className="output-meta">
            <span className="chip">{out.latencyMs.toFixed(0)} ms</span>
          </div>
          <pre className="output-json">{JSON.stringify(out.task, null, 2)}</pre>
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
