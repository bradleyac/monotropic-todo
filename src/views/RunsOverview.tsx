import type { Run, Task } from "../types";

type Props = {
  runs: Run[];
  tasks: Record<string, Task>;
  onEnterRun: (runId: string) => void;
};

export function RunsOverview({ runs, tasks, onEnterRun }: Props) {
  const total = runs.reduce((s, r) => s + r.estMinutes, 0);
  return (
    <section className="overview">
      <header className="overview-header">
        <h1>today</h1>
        <p className="muted">
          {runs.length} runs · about {fmt(total)}
        </p>
      </header>
      <ul className="run-list">
        {runs.map((run) => (
          <li key={run.id}>
            <button className="run-card" onClick={() => onEnterRun(run.id)}>
              <div className="run-card-label">{run.label}</div>
              <div className="run-card-meta">
                {run.taskIds.length} tasks · {fmt(run.estMinutes)} ·{" "}
                <span className="chip">{run.shape.energy} energy</span>{" "}
                <span className="chip">{run.shape.social}</span>
              </div>
              <ul className="run-card-tasks">
                {run.taskIds.slice(0, 3).map((id) => (
                  <li key={id}>{tasks[id].title}</li>
                ))}
                {run.taskIds.length > 3 && (
                  <li className="muted">+ {run.taskIds.length - 3} more</li>
                )}
              </ul>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function fmt(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
