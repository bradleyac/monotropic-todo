import type { CognitiveMode, Context, Task } from "./types";
import { addDays, parseISODate, startOfWeek, toISODate } from "./dateUtils";

// Contexts that are expensive to enter ("leave the house", "be in a call").
// Only anchors with one of these contexts get the strong context-cluster
// bonus, because that's where "while you're already out / on the phone"
// actually saves a switch. Desk anchors don't pull arbitrary desk work.
const HIGH_FRICTION_CONTEXTS = new Set<Context>(["out-and-about", "phone-only"]);

// Greedy day-assignment.
//
// Anchors (tasks with `at`) and pinned tasks are locked. Everything else is
// scored against each candidate day this week and placed on the highest-
// scoring one. The scoring favours:
//   - clustering with existing anchors of the same context (errands + a
//     dentist appointment land together)
//   - clustering with any same-context or same-mode task
//   - keeping each day's set of distinct modes small (limit context-switches)
//
// `placeTask` places a single task given the current schedule and is what
// capture uses (so existing placements don't shift when you add one task).
// `planSchedule` rebuilds scheduledFor for every non-anchor non-pinned task
// from scratch, used by the explicit "re-plan week" action.

// Weights chosen so the dominant signal is "stay in the same cognitive mode"
// (SAME_MODE) and "introducing a new mode costs more the busier the day"
// (NEW_MODE_PENALTY_PER_MODE). Same-context without same-mode is a small
// nudge — being already at the desk shouldn't justify a mode shift. Anchor
// matches are amplified so an appointment pulls related work onto its day.
const ANCHOR_CONTEXT_MATCH = 18;
const ANCHOR_MODE_MATCH = 10;
const SAME_CONTEXT = 2;
const SAME_MODE = 6;
const NEW_MODE_PENALTY_PER_MODE = 8;
const EARLIER_BIAS = 0.1;

export function placeTask(task: Task, existing: Task[], today: string): string {
  if (task.at) return task.at.slice(0, 10);

  const candidates = candidateDates(task, today);
  if (candidates.length === 0) return today;

  let best: { date: string; score: number } | null = null;
  for (let i = 0; i < candidates.length; i++) {
    const date = candidates[i];
    const onDay = existing.filter((t) => t.scheduledFor === date);
    const score = scoreDay(task, onDay, i);
    if (!best || score > best.score) best = { date, score };
  }
  return best!.date;
}

export function planSchedule(tasks: Task[], today: string): Task[] {
  // 1. Anchors: scheduledFor is fixed by `at`.
  const placed: Task[] = [];
  const remaining: Task[] = [];
  for (const t of tasks) {
    if (t.at) {
      placed.push({ ...t, scheduledFor: t.at.slice(0, 10) });
    } else if (t.pinned && t.scheduledFor) {
      placed.push(t);
    } else {
      remaining.push(t);
    }
  }

  // 2. Flexible tasks: place by urgency. Earliest dueBy first; tasks without
  //    a dueBy go last (most freedom).
  remaining.sort((a, b) => {
    if (a.dueBy && !b.dueBy) return -1;
    if (!a.dueBy && b.dueBy) return 1;
    if (a.dueBy && b.dueBy) return a.dueBy.localeCompare(b.dueBy);
    return 0;
  });

  for (const t of remaining) {
    const date = placeTask(t, placed, today);
    placed.push({ ...t, scheduledFor: date });
  }
  return placed;
}

function candidateDates(task: Task, today: string): string[] {
  const todayDate = parseISODate(today);
  const weekEnd = addDays(startOfWeek(todayDate), 6);
  let stop = weekEnd;
  if (task.dueBy) {
    const due = parseISODate(task.dueBy);
    if (due < todayDate) return [today]; // overdue — schedule for today
    if (due < weekEnd) stop = due;
  }
  const out: string[] = [];
  for (let d = todayDate; d <= stop; d = addDays(d, 1)) {
    out.push(toISODate(d));
  }
  return out;
}

function scoreDay(task: Task, onDay: Task[], dayIndex: number): number {
  let score = 0;
  const modes = new Set<CognitiveMode>();

  for (const e of onDay) {
    modes.add(e.affinity.mode);
    const isAnchor = Boolean(e.at);
    if (e.affinity.mode === task.affinity.mode) {
      score += isAnchor ? ANCHOR_MODE_MATCH : SAME_MODE;
    }
    if (e.affinity.context === task.affinity.context) {
      const highFriction = HIGH_FRICTION_CONTEXTS.has(task.affinity.context);
      score += isAnchor && highFriction ? ANCHOR_CONTEXT_MATCH : SAME_CONTEXT;
    }
  }

  // Crowding: discourage adding a new mode to a day that already has tasks
  // of other modes.
  if (modes.size > 0 && !modes.has(task.affinity.mode)) {
    score -= NEW_MODE_PENALTY_PER_MODE * modes.size;
  }

  // Mild bias toward earlier days so ties resolve sensibly.
  score -= EARLIER_BIAS * dayIndex;
  return score;
}
