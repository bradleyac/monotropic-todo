import type { CognitiveMode, Task } from "../types";
import {
  DAY_NAMES,
  addDays,
  dayOfWeek,
  parseISODate,
  startOfWeek,
  toISODate,
} from "../dateUtils";

type Props = {
  selected: string;
  today: string;
  tasks: Task[];
  onSelect: (date: string) => void;
};

export function DayStrip({ selected, today, tasks, onSelect }: Props) {
  const weekStart = startOfWeek(parseISODate(today));
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const iso = toISODate(date);
    const dow = dayOfWeek(date);
    const dayTasks = tasks.filter((t) => t.scheduledFor === iso);
    const remaining = dayTasks.filter((t) => !t.done).length;
    const modes = new Set<CognitiveMode>();
    let hasAnchor = false;
    for (const t of dayTasks) {
      modes.add(t.affinity.mode);
      if (t.at) hasAnchor = true;
    }
    return {
      iso,
      label: DAY_NAMES[dow],
      dateNum: date.getDate(),
      shape: [...modes].slice(0, 2).join(", "),
      remaining,
      hasAnchor,
      isToday: iso === today,
      isPast: iso < today,
      isSelected: iso === selected,
    };
  });

  return (
    <nav className="day-strip" aria-label="this week">
      {days.map((d) => (
        <button
          key={d.iso}
          className={[
            "day-cell",
            d.isSelected ? "day-cell-selected" : "",
            d.isToday ? "day-cell-today" : "",
            d.isPast && !d.isSelected ? "day-cell-past" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onSelect(d.iso)}
          aria-current={d.isSelected ? "date" : undefined}
        >
          <span className="day-cell-dow">{d.label}</span>
          <span className="day-cell-num">
            {d.hasAnchor && <span className="day-cell-anchor-dot" aria-hidden />}
            {d.dateNum}
          </span>
          <span className="day-cell-theme">{d.shape || " "}</span>
          {d.remaining > 0 && (
            <span className="day-cell-badge">{d.remaining}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
