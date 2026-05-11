export const COGNITIVE_MODES = [
  "deep-thinking",
  "creative",
  "physical",
  "admin",
  "social-sync",
  "social-async",
] as const;

export type CognitiveMode = (typeof COGNITIVE_MODES)[number];

export type ParsedTask = {
  title: string;
  // ISO 8601 date ("YYYY-MM-DD") or datetime ("YYYY-MM-DDTHH:mm"), or null
  // when the description doesn't specify a deadline.
  deadline: string | null;
  cognitiveMode: CognitiveMode;
  estimatedMinutes: number;
};
