import type { Task, WeekThemes } from "../types";
import { DAY_NAMES, themeLabel } from "../themes";
import {
  addDays,
  dayOfWeek,
  parseISODate,
  startOfWeek,
  toISODate,
} from "../dateUtils";

type Props = {
  selected: string;
  today: string;
  themes: WeekThemes;
  tasks: Task[];
  onSelect: (date: string) => void;
};

export function DayStrip({ selected, today, themes, tasks, onSelect }: Props) {
  const weekStart = startOfWeek(parseISODate(today));
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const iso = toISODate(date);
    const dow = dayOfWeek(date);
    const dayTasks = tasks.filter((t) => t.scheduledFor === iso);
    const remaining = dayTasks.filter((t) => !t.done).length;
    return {
      iso,
      dow,
      label: DAY_NAMES[dow],
      dateNum: date.getDate(),
      modes: themes[dow],
      remaining,
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
          <span className="day-cell-num">{d.dateNum}</span>
          <span className="day-cell-theme">{themeLabel(d.modes)}</span>
          {d.remaining > 0 && (
            <span className="day-cell-badge">{d.remaining}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
