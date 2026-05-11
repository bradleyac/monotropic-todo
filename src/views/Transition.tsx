import type { Run, Task } from "../types";
import { transitionPrompt } from "../planner";

type Props = {
  from: Run | null;
  to: Run | null;
  tasks: Record<string, Task>;
  onBegin: () => void;
  onBackToOverview: () => void;
};

export function Transition({ from, to, tasks, onBegin, onBackToOverview }: Props) {
  if (!to) {
    return (
      <section className="transition">
        <h1>day done</h1>
        <p className="muted">no more runs planned. close the laptop.</p>
        <button className="primary" onClick={onBackToOverview}>
          back to today
        </button>
      </section>
    );
  }
  const remaining = to.taskIds.filter((id) => !tasks[id].done).length;
  return (
    <section className="transition">
      <p className="eyebrow">next</p>
      <h1>{to.label}</h1>
      <p className="shift">{transitionPrompt(from, to)}</p>
      <p className="muted">
        {remaining} {remaining === 1 ? "task" : "tasks"} left · {to.estMinutes} min
      </p>
      <div className="transition-actions">
        <button className="primary" onClick={onBegin}>
          begin
        </button>
        <button className="link" onClick={onBackToOverview}>
          not yet
        </button>
      </div>
    </section>
  );
}
