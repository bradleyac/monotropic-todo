import type { DayOfWeek, WeekThemes } from "./types";

// Default weekly theme. Each weekday opens 1–2 cognitive modes; tasks of
// those modes auto-route to that day. Sunday is intentionally empty as a
// rest day. User-editable in a real build; fixed for now.
export const DEFAULT_THEMES: WeekThemes = {
  0: [], // Sun — rest
  1: ["deep"], // Mon — deep
  2: ["admin", "social"], // Tue — admin + calls
  3: ["deep", "creative"], // Wed — deep / creative
  4: ["creative"], // Thu — creative
  5: ["physical", "admin"], // Fri — errands + tidy admin
  6: ["physical"], // Sat — errands
};

export const DAY_NAMES: Record<DayOfWeek, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

export function themeLabel(modes: import("./types").CognitiveMode[]): string {
  if (modes.length === 0) return "rest";
  return modes.join(" + ");
}
