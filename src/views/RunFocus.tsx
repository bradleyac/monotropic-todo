import type { Run, Task } from "../types";

type Props = {
  run: Run;
  tasks: Record<string, Task>;
  onToggle: (taskId: string) => void;
  onExit: () => void;
};

export function RunFocus({ run, tasks, onToggle, onExit }: Props) {
  const items = run.taskIds.map((id) => tasks[id]);
  const remaining = items.filter((t) => !t.done).length;

  return (
    <section className="focus">
      <header className="focus-header">
        <button className="link" onClick={onExit} aria-label="back to today">
          ← today
        </button>
        <h1>{run.label}</h1>
        <p className="muted">{remaining} left</p>
      </header>
      <ul className="task-list">
        {items.map((t) => (
          <li key={t.id} className={t.done ? "task done" : "task"}>
            <label>
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => onToggle(t.id)}
              />
              <span className="task-title">{t.title}</span>
              <span className="task-est muted">{t.estMinutes}m</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
