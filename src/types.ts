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
  notes?: string;
};

export type Run = {
  id: string;
  label: string;
  shape: Affinity;
  taskIds: string[];
  estMinutes: number;
};
