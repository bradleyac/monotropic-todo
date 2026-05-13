import { useState } from "react";
import {
  EVAL_CASES,
  EVAL_TODAY,
  allPass,
  check,
  type CheckResults,
  type EvalCase,
} from "../evals";
import { parseTask, type ParseError } from "../parser";
import type { ParsedTask } from "../types";

type Props = {
  model: string;
};

type Row = {
  case: EvalCase;
  state:
  | { kind: "pending" }
  | { kind: "running" }
  | {
    kind: "ok";
    task: ParsedTask;
    checks: CheckResults;
    latencyMs: number;
    raw: string;
    evalCount: number | null;
    promptEvalCount: number | null;
  }
  | { kind: "err"; message: string; raw: string | undefined };
};

export function EvalRunner({ model }: Props) {
  const [rows, setRows] = useState<Row[]>(() =>
    EVAL_CASES.map((c) => ({ case: c, state: { kind: "pending" } })),
  );
  const [running, setRunning] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [useSchema, setUseSchema] = useState(true);

  async function runAll() {
    setRunning(true);
    // Reset all rows first so the UI clears stale results.
    setRows(EVAL_CASES.map((c) => ({ case: c, state: { kind: "pending" } })));

    // Run sequentially. Parallel calls would hammer a single Ollama process
    // and produce noisier latency numbers without much wall-clock benefit
    // for a 10-item run.
    for (let i = 0; i < EVAL_CASES.length; i++) {
      const c = EVAL_CASES[i];
      setRows((prev) => updateRow(prev, i, { kind: "running" }));
      try {
        const r = await parseTask(c.input, EVAL_TODAY, model, useSchema);
        const checks = check(c, r.task);
        setRows((prev) =>
          updateRow(prev, i, {
            kind: "ok",
            task: r.task,
            checks,
            latencyMs: r.latencyMs,
            raw: r.raw,
            evalCount: r.evalCount,
            promptEvalCount: r.promptEvalCount,
          }),
        );
      } catch (e) {
        const err = e as ParseError;
        setRows((prev) =>
          updateRow(prev, i, { kind: "err", message: err.message, raw: err.raw }),
        );
      }
    }
    setRunning(false);
  }

  const completed = rows.filter((r) => r.state.kind === "ok");
  const passed = completed.filter(
    (r) => r.state.kind === "ok" && allPass(r.state.checks),
  ).length;
  const failed = completed.length - passed;
  const errored = rows.filter((r) => r.state.kind === "err").length;

  return (
    <section className="evals">
      <div className="evals-header">
        <button className="primary" onClick={runAll} disabled={running}>
          {running ? "running…" : "run evals"}
        </button>
        <label className="raw-toggle">
          <input
            type="checkbox"
            checked={useSchema}
            onChange={(e) => setUseSchema(e.target.checked)}
            disabled={running}
          />
          <span>constrain with JSON schema</span>
        </label>
        <label className="raw-toggle">
          <input
            type="checkbox"
            checked={showRaw}
            onChange={(e) => setShowRaw(e.target.checked)}
          />
          <span>show raw output</span>
        </label>
        {completed.length > 0 && (
          <div className="evals-summary">
            <span className="chip chip-pass">{passed} pass</span>
            <span className="chip chip-fail">{failed} fail</span>
            {errored > 0 && (
              <span className="chip chip-err">{errored} error</span>
            )}
            <span className="muted">
              of {EVAL_CASES.length} · today fixed to {EVAL_TODAY}
            </span>
          </div>
        )}
      </div>

      <ul className="eval-list">
        {rows.map((row) => (
          <li key={row.case.id} className={rowClass(row)}>
            <div className="eval-input">{row.case.input}</div>
            <EvalBody row={row} showRaw={showRaw} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function RenderError({ row }: { row: Row }) {
  if (row.state.kind !== 'err') return null;
  return <div><div className="err-message small">{row.state.message}</div><div className="muted small">{row.state.raw}</div></div>
}


function EvalBody({ row, showRaw }: { row: Row; showRaw: boolean }) {
  const s = row.state;
  if (s.kind === "pending") return <div className="muted small">pending</div>;
  if (s.kind === "running") return <div className="muted small">running…</div>;
  if (s.kind === "err") return RenderError({ row });

  const exp = row.case.expected;
  const t = s.task;
  return (
    <div className="eval-body">
      <FieldRow
        label="mode"
        expected={Array.isArray(exp.mode) ? exp.mode.join(" | ") : exp.mode}
        actual={t.cognitiveMode}
        pass={s.checks.mode}
      />
      <FieldRow
        label="context"
        expected={
          Array.isArray(exp.context) ? exp.context.join(" | ") : exp.context
        }
        actual={t.context}
        pass={s.checks.context}
      />
      <FieldRow
        label="minutes"
        expected={`${exp.minutes[0]}–${exp.minutes[1]}`}
        actual={String(t.estimatedMinutes)}
        pass={s.checks.minutes}
      />
      <FieldRow
        label="deadline"
        expected={exp.deadline ?? "null"}
        actual={t.deadline ?? "null"}
        pass={s.checks.deadline}
      />
      <div className="eval-meta">
        <span className="chip">{s.latencyMs.toFixed(0)} ms</span>
        {s.evalCount !== null && (
          <span className="chip">{s.evalCount} out tok</span>
        )}
        {s.promptEvalCount !== null && (
          <span className="chip">{s.promptEvalCount} in tok</span>
        )}
        <span className="muted small">
          title: {t.title} · {s.raw.length} chars raw
        </span>
      </div>
      {showRaw && <pre className="eval-raw">{s.raw}</pre>}
    </div>
  );
}

function FieldRow({
  label,
  expected,
  actual,
  pass,
}: {
  label: string;
  expected: string;
  actual: string;
  pass: boolean;
}) {
  return (
    <div className={`field-row ${pass ? "pass" : "fail"}`}>
      <span className="field-row-label">{label}</span>
      <span className="field-row-expected">{expected}</span>
      <span className="field-row-arrow">→</span>
      <span className="field-row-actual">{actual}</span>
      <span className="field-row-mark">{pass ? "✓" : "✗"}</span>
    </div>
  );
}

function rowClass(row: Row): string {
  if (row.state.kind === "ok") {
    return allPass(row.state.checks) ? "eval-row eval-row-pass" : "eval-row eval-row-fail";
  }
  if (row.state.kind === "err") return "eval-row eval-row-err";
  if (row.state.kind === "running") return "eval-row eval-row-running";
  return "eval-row";
}

function updateRow(rows: Row[], i: number, state: Row["state"]): Row[] {
  const next = rows.slice();
  next[i] = { ...next[i], state };
  return next;
}
