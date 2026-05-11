import type { CognitiveMode, ParsedTask } from "./types";

// Pinning "today" makes relative-date evals reproducible. 2026-05-11 is a
// Monday, so "Tuesday" → 2026-05-12, "Friday" → 2026-05-15, "tomorrow" →
// 2026-05-12, etc.
export const EVAL_TODAY = "2026-05-11";

type ModeSpec = CognitiveMode | CognitiveMode[];

export type EvalCase = {
  id: string;
  input: string;
  expected: {
    mode: ModeSpec;
    // inclusive [min, max] minutes range — a reasonable human estimate
    // would land somewhere inside.
    minutes: [number, number];
    // "YYYY-MM-DD" matches date portion; "YYYY-MM-DDTHH:mm" requires full
    // datetime match; null requires the model to emit null.
    deadline: string | null;
  };
};

export const EVAL_CASES: EvalCase[] = [
  {
    id: "async-email",
    input: "Email Sara about the Q3 budget",
    expected: { mode: "social-async", minutes: [5, 20], deadline: null },
  },
  {
    id: "creative-design",
    input: "Design the new onboarding flow",
    expected: {
      mode: ["creative", "deep-thinking"],
      minutes: [45, 240],
      deadline: null,
    },
  },
  {
    id: "anchor-dentist",
    input: "Dentist appointment Tuesday at 3pm",
    expected: {
      mode: "physical",
      minutes: [30, 90],
      deadline: "2026-05-12T15:00",
    },
  },
  {
    id: "admin-deadline",
    input: "Submit expense report by Friday",
    expected: { mode: "admin", minutes: [10, 30], deadline: "2026-05-15" },
  },
  {
    id: "sync-1on1",
    input: "Weekly 1:1 with manager Wednesday at 10am",
    expected: {
      mode: "social-sync",
      minutes: [25, 60],
      deadline: "2026-05-13T10:00",
    },
  },
  {
    id: "physical-errand",
    input: "Grocery run",
    expected: { mode: "physical", minutes: [20, 90], deadline: null },
  },
  {
    id: "deep-debug",
    input: "Debug the auth race condition before tomorrow's demo",
    expected: {
      mode: "deep-thinking",
      minutes: [45, 240],
      deadline: "2026-05-12",
    },
  },
  {
    id: "creative-writing",
    input: "Write the launch announcement blog post",
    expected: { mode: "creative", minutes: [45, 240], deadline: null },
  },
  {
    id: "async-reply",
    input: "Reply to Tom's email about the contract",
    expected: { mode: "social-async", minutes: [5, 30], deadline: null },
  },
  {
    id: "physical-pickup",
    input: "Pick up package from the post office",
    expected: { mode: "physical", minutes: [15, 60], deadline: null },
  },
];

export type CheckResults = {
  mode: boolean;
  minutes: boolean;
  deadline: boolean;
};

export function check(c: EvalCase, task: ParsedTask): CheckResults {
  return {
    mode: checkMode(c.expected.mode, task.cognitiveMode),
    minutes:
      task.estimatedMinutes >= c.expected.minutes[0] &&
      task.estimatedMinutes <= c.expected.minutes[1],
    deadline: checkDeadline(c.expected.deadline, task.deadline),
  };
}

export function allPass(r: CheckResults): boolean {
  return r.mode && r.minutes && r.deadline;
}

function checkMode(expected: ModeSpec, actual: CognitiveMode): boolean {
  return Array.isArray(expected) ? expected.includes(actual) : expected === actual;
}

function checkDeadline(expected: string | null, actual: string | null): boolean {
  if (expected === null) return actual === null;
  if (actual === null) return false;
  // Expected without "T" is date-only; compare against actual's date portion.
  if (!expected.includes("T")) return actual.slice(0, 10) === expected;
  return actual === expected;
}
