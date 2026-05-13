import type { Task } from "./types";
import { addDays, startOfWeek, toISODate } from "./dateUtils";

// Seed tasks anchored to the current ISO week so the demo works whenever
// it's loaded. `at` locks the day (and time); `dueBy` constrains how late
// the scheduler can place a flexible task. Tasks without either are fully
// flexible and rely on the scheduler to cluster them sensibly.
//
// `scheduledFor: ""` is a placeholder — the App runs planSchedule once on
// mount, which fills it in for flexible tasks and derives it from `at` for
// anchors.
const monday = startOfWeek(new Date());
const on = (offsetFromMonday: number) =>
  toISODate(addDays(monday, offsetFromMonday));
const at = (offsetFromMonday: number, hh: number, mm = 0) => {
  const d = addDays(monday, offsetFromMonday);
  const h = String(hh).padStart(2, "0");
  const m = String(mm).padStart(2, "0");
  return `${toISODate(d)}T${h}:${m}`;
};

export const seedTasks: Task[] = [
  // --- Anchors ---
  {
    id: "anchor-dentist",
    title: "Dentist appointment",
    estMinutes: 60,
    affinity: { mode: "physical", energy: "medium", context: "out-and-about", social: "live-with-others" },
    done: false,
    scheduledFor: "",
    at: at(1, 15, 0), // Tue 3pm
  },
  {
    id: "anchor-standup",
    title: "Team weekly standup",
    estMinutes: 30,
    affinity: { mode: "social", energy: "medium", context: "at-desk", social: "live-with-others" },
    done: false,
    scheduledFor: "",
    at: at(4, 10, 0), // Fri 10am
  },

  // --- Deep work with a deadline ---
  {
    id: "t1",
    title: "Draft Q2 strategy memo",
    estMinutes: 60,
    affinity: { mode: "deep", energy: "high", context: "at-desk", social: "solo" },
    done: false,
    scheduledFor: "",
    dueBy: on(3), // Thu
  },
  {
    id: "t2",
    title: "Review architecture doc",
    estMinutes: 40,
    affinity: { mode: "deep", energy: "high", context: "at-desk", social: "solo" },
    done: false,
    scheduledFor: "",
  },

  // --- Creative ---
  {
    id: "t3",
    title: "Sketch onboarding flow",
    estMinutes: 30,
    affinity: { mode: "creative", energy: "high", context: "at-desk", social: "solo" },
    done: false,
    scheduledFor: "",
    dueBy: on(4), // Fri
  },

  // --- Admin ---
  {
    id: "t4",
    title: "Reply to Mira about contract",
    estMinutes: 10,
    affinity: { mode: "admin", energy: "low", context: "at-desk", social: "async-with-others" },
    done: false,
    scheduledFor: "",
  },
  {
    id: "t5",
    title: "Submit expense report",
    estMinutes: 15,
    affinity: { mode: "admin", energy: "low", context: "at-desk", social: "async-with-others" },
    done: false,
    scheduledFor: "",
    dueBy: on(4), // Fri
  },
  {
    id: "t6",
    title: "File last month's receipts",
    estMinutes: 20,
    affinity: { mode: "admin", energy: "low", context: "at-desk", social: "solo" },
    done: false,
    scheduledFor: "",
  },

  // --- Errands (should cluster with dentist on Tue) ---
  {
    id: "t7",
    title: "Pick up prescription",
    estMinutes: 25,
    affinity: { mode: "physical", energy: "medium", context: "out-and-about", social: "solo" },
    done: false,
    scheduledFor: "",
  },
  {
    id: "t8",
    title: "Drop off library books",
    estMinutes: 15,
    affinity: { mode: "physical", energy: "medium", context: "out-and-about", social: "solo" },
    done: false,
    scheduledFor: "",
  },
  {
    id: "t9",
    title: "Buy coffee filters",
    estMinutes: 10,
    affinity: { mode: "physical", energy: "medium", context: "out-and-about", social: "solo" },
    done: false,
    scheduledFor: "",
  },
];
