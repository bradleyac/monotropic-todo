import type { Affinity, CognitiveMode, Energy, Run, Task } from "./types";

const ENERGY_RANK: Record<Energy, number> = { high: 2, medium: 1, low: 0 };

const MODE_LABEL: Record<CognitiveMode, string> = {
  deep: "deep focus",
  admin: "admin",
  creative: "creative",
  physical: "out & about",
  social: "social",
};

// A run is defined by a (mode, context) key. Tasks within a run sort by
// energy descending so the hardest item is first while attention is freshest.
// Only tasks scheduled for `date` are considered.
export function planRuns(tasks: Task[], date: string): Run[] {
  const groups = new Map<string, Task[]>();
  for (const t of tasks) {
    if (t.scheduledFor !== date) continue;
    const key = `${t.affinity.mode}::${t.affinity.context}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(t);
    groups.set(key, bucket);
  }

  const runs: Run[] = [];
  for (const [key, bucket] of groups) {
    bucket.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return ENERGY_RANK[b.affinity.energy] - ENERGY_RANK[a.affinity.energy];
    });
    const shape = dominantShape(bucket);
    const remaining = bucket.filter((t) => !t.done);
    runs.push({
      id: `run:${date}:${key}`,
      label: runLabel(shape),
      shape,
      taskIds: bucket.map((t) => t.id),
      estMinutes: remaining.reduce((s, t) => s + t.estMinutes, 0),
    });
  }

  // Order runs: high-energy deep/creative first, low-energy admin in the
  // middle, physical/out-and-about last (so you batch errands once).
  runs.sort((a, b) => runOrder(a) - runOrder(b));
  return runs;
}

function dominantShape(tasks: Task[]): Affinity {
  return tasks[0].affinity;
}

function runLabel(shape: Affinity): string {
  const mode = MODE_LABEL[shape.mode];
  if (shape.context === "out-and-about") return `${mode} — errands`;
  if (shape.context === "phone-only") return `${mode} — phone`;
  return mode;
}

function runOrder(run: Run): number {
  if (run.shape.context === "out-and-about") return 90;
  switch (run.shape.mode) {
    case "deep":
      return 10;
    case "creative":
      return 20;
    case "admin":
      return 50;
    case "social":
      return 60;
    case "physical":
      return 80;
  }
}

export function transitionPrompt(from: Run | null, to: Run): string {
  if (!from) return `start the day with ${to.label}`;
  if (from.shape.context !== to.shape.context) {
    if (to.shape.context === "out-and-about") return "shoes on, keys, list of stops";
    if (to.shape.context === "at-desk") return "back at the desk, water, close other tabs";
  }
  if (from.shape.mode === "deep" && to.shape.mode === "admin") {
    return "stand up, stretch, let the deep thread settle before admin";
  }
  if (from.shape.mode === "admin" && to.shape.mode === "deep") {
    return "close inbox, one breath, pick the hardest thing first";
  }
  return `shift into ${to.label}`;
}
