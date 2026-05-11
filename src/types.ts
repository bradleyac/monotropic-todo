export type CognitiveMode = "deep" | "admin" | "creative" | "physical" | "social";
export type Energy = "high" | "medium" | "low";
export type Context = "at-desk" | "at-home-anywhere" | "out-and-about" | "phone-only";
export type SocialDemand = "solo" | "async-with-others" | "live-with-others";

export type Affinity = {
  mode: CognitiveMode;
  energy: Energy;
  context: Context;
  social: SocialDemand;
};

export type Task = {
  id: string;
  title: string;
  estMinutes: number;
  affinity: Affinity;
  done: boolean;
  scheduledFor: string; // ISO date, e.g. "2026-05-11"
  notes?: string;
};

export type Run = {
  id: string;
  label: string;
  shape: Affinity;
  taskIds: string[];
  estMinutes: number;
};

// Sunday=0 … Saturday=6, matching Date.prototype.getDay()
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type WeekThemes = Record<DayOfWeek, CognitiveMode[]>;
