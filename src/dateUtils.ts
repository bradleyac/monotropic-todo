import type { DayOfWeek } from "./types";

export const DAY_NAMES: Record<DayOfWeek, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function dayOfWeek(d: Date): DayOfWeek {
  return d.getDay() as DayOfWeek;
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// Monday as start of week.
export function startOfWeek(d: Date): Date {
  const r = new Date(d);
  const dow = r.getDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  r.setDate(r.getDate() + offset);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function formatAt(iso: string): string {
  const time = iso.slice(11, 16);
  const [hh, mm] = time.split(":").map(Number);
  const period = hh >= 12 ? "pm" : "am";
  const h12 = hh % 12 || 12;
  return mm ? `${h12}:${String(mm).padStart(2, "0")}${period}` : `${h12}${period}`;
}
