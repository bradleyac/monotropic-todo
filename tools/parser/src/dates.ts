// Date helpers + symbolic deadline resolution. The model emits tokens
// ("tomorrow", "tuesday", "next-friday", "YYYY-MM-DD") and this module
// turns them into ISO date / datetime strings, keeping arithmetic out of
// the LLM entirely.

export const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

// Next date with the given weekday on or after `from`. If `from` already
// is that weekday, returns `from`.
export function nextOccurrence(from: Date, target: Weekday): Date {
  const targetIdx = WEEKDAYS.indexOf(target);
  const diff = (targetIdx - from.getDay() + 7) % 7;
  return addDays(from, diff);
}

export function resolveDeadline(
  token: string | null,
  time: string | null,
  today: string,
): string | null {
  if (!token) return null;
  const date = resolveDate(token, today);
  if (!date) return null;
  const iso = formatDate(date);
  if (time && /^\d{2}:\d{2}$/.test(time)) return `${iso}T${time}`;
  return iso;
}

function resolveDate(token: string, today: string): Date | null {
  const todayDate = parseDate(today);
  if (token === "today") return todayDate;
  if (token === "tomorrow") return addDays(todayDate, 1);
  if (isWeekday(token)) return nextOccurrence(todayDate, token);
  if (token.startsWith("next-")) {
    const day = token.slice(5);
    if (isWeekday(day)) {
      // "next-X" = the X that's at least 7 days from today. Anchor one
      // week forward, then find the next X on or after that anchor.
      return nextOccurrence(addDays(todayDate, 7), day);
    }
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(token)) return parseDate(token);
  return null;
}

function isWeekday(s: string): s is Weekday {
  return (WEEKDAYS as readonly string[]).includes(s);
}
