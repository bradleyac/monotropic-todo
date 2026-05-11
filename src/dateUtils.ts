import type { DayOfWeek } from "./types";

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
