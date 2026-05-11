import type { Task } from "./types";

export const seedTasks: Task[] = [
  {
    id: "t1",
    title: "Draft Q2 strategy memo",
    estMinutes: 60,
    affinity: { mode: "deep", energy: "high", context: "at-desk", social: "solo" },
    done: false,
  },
  {
    id: "t2",
    title: "Review architecture doc",
    estMinutes: 40,
    affinity: { mode: "deep", energy: "high", context: "at-desk", social: "solo" },
    done: false,
  },
  {
    id: "t3",
    title: "Sketch onboarding flow",
    estMinutes: 30,
    affinity: { mode: "creative", energy: "high", context: "at-desk", social: "solo" },
    done: false,
  },
  {
    id: "t4",
    title: "Reply to Mira about contract",
    estMinutes: 10,
    affinity: { mode: "admin", energy: "low", context: "at-desk", social: "async-with-others" },
    done: false,
  },
  {
    id: "t5",
    title: "Submit expense report",
    estMinutes: 15,
    affinity: { mode: "admin", energy: "low", context: "at-desk", social: "async-with-others" },
    done: false,
  },
  {
    id: "t6",
    title: "File last month's receipts",
    estMinutes: 20,
    affinity: { mode: "admin", energy: "low", context: "at-desk", social: "solo" },
    done: false,
  },
  {
    id: "t7",
    title: "Pick up prescription",
    estMinutes: 25,
    affinity: { mode: "physical", energy: "medium", context: "out-and-about", social: "solo" },
    done: false,
  },
  {
    id: "t8",
    title: "Drop off library books",
    estMinutes: 15,
    affinity: { mode: "physical", energy: "medium", context: "out-and-about", social: "solo" },
    done: false,
  },
  {
    id: "t9",
    title: "Buy coffee filters",
    estMinutes: 10,
    affinity: { mode: "physical", energy: "medium", context: "out-and-about", social: "solo" },
    done: false,
  },
  {
    id: "t10",
    title: "Call dentist to reschedule",
    estMinutes: 10,
    affinity: { mode: "admin", energy: "medium", context: "phone-only", social: "live-with-others" },
    done: false,
  },
];
