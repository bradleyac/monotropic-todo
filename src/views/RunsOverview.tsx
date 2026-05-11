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
          {runs.length} runs · about {fmt(total)} left
        </p>
      </header>
      <ul className="run-list">
        {runs.map((run) => {
          const remaining = run.taskIds.filter((id) => !tasks[id].done);
          const isDone = remaining.length === 0;
          const preview = run.taskIds.slice(0, 3);
          const hidden = run.taskIds.length - preview.length;
          const countLabel = isDone
            ? `${run.taskIds.length} done`
            : remaining.length === run.taskIds.length
              ? `${run.taskIds.length} ${run.taskIds.length === 1 ? "task" : "tasks"}`
              : `${remaining.length} of ${run.taskIds.length}`;
          return (
            <li key={run.id}>
              <button
                className={isDone ? "run-card run-card-done" : "run-card"}
                onClick={() => onEnterRun(run.id)}
              >
                <div className="run-card-label">
                  {run.label}
                  {isDone && <span className="run-card-check"> ✓</span>}
                </div>
                <div className="run-card-meta">
                  {isDone ? countLabel : `${countLabel} · ${fmt(run.estMinutes)}`}{" "}
                  · <span className="chip">{run.shape.energy} energy</span>{" "}
                  <span className="chip">{run.shape.social}</span>
                </div>
                <ul className="run-card-tasks">
                  {preview.map((id) => (
                    <li
                      key={id}
                      className={tasks[id].done ? "muted strike" : undefined}
                    >
                      {tasks[id].title}
                    </li>
                  ))}
                  {hidden > 0 && (
                    <li className="muted">+ {hidden} more</li>
                  )}
                </ul>
              </button>
            </li>
          );
        })}
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
