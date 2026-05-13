import type { Run, Task } from "../types";
import { useFlipContainer } from "../useFlip";
import { formatAt } from "../dateUtils";

type Props = {
  run: Run;
  tasks: Record<string, Task>;
  onToggle: (taskId: string) => void;
  onExit: () => void;
};

export function RunFocus({ run, tasks, onToggle, onExit }: Props) {
  const listRef = useFlipContainer<HTMLUListElement>();
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
      <ul className="task-list" ref={listRef}>
        {items.map((t) => (
          <li
            key={t.id}
            data-flip-key={t.id}
            className={t.done ? "task done" : "task"}
          >
            <label>
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => onToggle(t.id)}
              />
              <span className="task-title">
                {t.at && <span className="at-time">{formatAt(t.at)}</span>}
                {t.title}
              </span>
              <span className="task-est muted">{t.estMinutes}m</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
