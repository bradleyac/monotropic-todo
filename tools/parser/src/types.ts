export const COGNITIVE_MODES = [
  "deep-thinking",
  "creative",
  "physical",
  "admin",
  "social-sync",
  "social-async",
] as const;

export type CognitiveMode = (typeof COGNITIVE_MODES)[number];

// Where/how the task has to happen. Orthogonal to cognitive mode: a dentist
// appointment is social-sync by mode (you're interacting with someone) but
// out-and-about by context (you have to leave the house). The scheduler
// uses context to cluster errands with anchored appointments — that's the
// "while you're already out, do the other errands" intuition.
export const CONTEXTS = [
  "at-desk",
  "at-home",
  "out-and-about",
  "phone-only",
] as const;

export type Context = (typeof CONTEXTS)[number];

export type RawParsedTask = {
  title: string;
  deadline: string | null;
  deadlineTime: string | null;
  cognitiveMode: CognitiveMode;
  context: Context;
  estimatedMinutes: number;
};

export type ParsedTask = {
  title: string;
  deadline: string | null;
  cognitiveMode: CognitiveMode;
  context: Context;
  estimatedMinutes: number;
};
