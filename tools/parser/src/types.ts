export const COGNITIVE_MODES = [
  "deep-thinking",
  "creative",
  "physical",
  "admin",
  "social-sync",
  "social-async",
] as const;

export type CognitiveMode = (typeof COGNITIVE_MODES)[number];

// What the model emits. `deadline` is a symbolic token ("today", "tuesday",
// "next-friday", "2026-05-15", or null) — the resolver in dates.ts turns it
// into an ISO string. Keeping the model out of date arithmetic.
export type RawParsedTask = {
  title: string;
  deadline: string | null;
  deadlineTime: string | null;
  cognitiveMode: CognitiveMode;
  estimatedMinutes: number;
};

// User-facing shape after the resolver has run. `deadline` is "YYYY-MM-DD"
// or "YYYY-MM-DDTHH:mm" or null.
export type ParsedTask = {
  title: string;
  deadline: string | null;
  cognitiveMode: CognitiveMode;
  estimatedMinutes: number;
};
