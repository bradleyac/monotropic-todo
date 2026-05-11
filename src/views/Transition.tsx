import type { Run } from "../types";
import { transitionPrompt } from "../planner";

type Props = {
  from: Run | null;
  to: Run | null;
  onBegin: () => void;
  onBackToOverview: () => void;
};

export function Transition({ from, to, onBegin, onBackToOverview }: Props) {
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
  return (
    <section className="transition">
      <p className="eyebrow">next</p>
      <h1>{to.label}</h1>
      <p className="shift">{transitionPrompt(from, to)}</p>
      <p className="muted">
        {to.taskIds.length} tasks · {to.estMinutes} min
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
