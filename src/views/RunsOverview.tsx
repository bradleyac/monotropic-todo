import type { Run, Task } from "../types";
import { useFlipContainer } from "../useFlip";
import { DAY_NAMES } from "../themes";
import { dayOfWeek, parseISODate } from "../dateUtils";

type Props = {
  runs: Run[];
  tasks: Record<string, Task>;
  selectedDate: string;
  today: string;
  onEnterRun: (runId: string) => void;
};

export function RunsOverview({
  runs,
  tasks,
  selectedDate,
  today,
  onEnterRun,
}: Props) {
  const total = runs.reduce((s, r) => s + r.estMinutes, 0);
  const heading =
    selectedDate === today
      ? "today"
      : DAY_NAMES[dayOfWeek(parseISODate(selectedDate))].toLowerCase();

  return (
    <section className="overview">
      <header className="overview-header">
        <h1>{heading}</h1>
        {runs.length > 0 ? (
          <p className="muted">
            {runs.length} {runs.length === 1 ? "run" : "runs"} · about{" "}
            {fmt(total)} left
          </p>
        ) : (
          <p className="muted">no runs planned</p>
        )}
      </header>
      {runs.length === 0 ? (
        <p className="empty">
          {selectedDate === today
            ? "nothing scheduled today. capture something below or peek at another day."
            : "nothing scheduled. tasks of this day's mode auto-land here."}
        </p>
      ) : (
        <ul className="run-list">
          {runs.map((run) => (
            <li key={run.id}>
              <RunCard run={run} tasks={tasks} onEnter={onEnterRun} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type CardProps = {
  run: Run;
  tasks: Record<string, Task>;
  onEnter: (runId: string) => void;
};

function RunCard({ run, tasks, onEnter }: CardProps) {
  const listRef = useFlipContainer<HTMLUListElement>();
  const remaining = run.taskIds.filter((id) => !tasks[id].done);
  const isDone = remaining.length === 0;
  const countLabel = isDone
    ? `${run.taskIds.length} done`
    : remaining.length === run.taskIds.length
      ? `${run.taskIds.length} ${run.taskIds.length === 1 ? "task" : "tasks"}`
      : `${remaining.length} of ${run.taskIds.length}`;
  return (
    <button
      className={isDone ? "run-card run-card-done" : "run-card"}
      onClick={() => onEnter(run.id)}
    >
      <div className="run-card-label">
        {run.label}
        {isDone && <span className="run-card-check"> ✓</span>}
      </div>
      <div className="run-card-meta">
        {isDone ? countLabel : `${countLabel} · ${fmt(run.estMinutes)}`} ·{" "}
        <span className="chip">{run.shape.energy} energy</span>{" "}
        <span className="chip">{run.shape.social}</span>
      </div>
      <ul className="run-card-tasks" ref={listRef}>
        {run.taskIds.map((id) => (
          <li
            key={id}
            data-flip-key={id}
            className={tasks[id].done ? "muted strike" : undefined}
          >
            {tasks[id].title}
          </li>
        ))}
      </ul>
    </button>
  );
}

function fmt(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
