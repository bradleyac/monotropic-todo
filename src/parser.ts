import type { Affinity, CognitiveMode, Task, WeekThemes } from "./types";
import { addDays, dayOfWeek, toISODate } from "./dateUtils";

// Mock natural-language parser. Real version will call a hosted LLM; this
// keyword-based stand-in is enough to demo the capture UX.
export function mockParse(input: string, themes: WeekThemes, from = new Date()): Task {
  const text = input.trim();
  const lower = text.toLowerCase();
  const affinity = guessAffinity(lower);
  return {
    id: `t-${crypto.randomUUID().slice(0, 8)}`,
    title: stripRecurrence(text),
    estMinutes: guessMinutes(lower),
    affinity,
    done: false,
    scheduledFor: nextMatchingDay(from, affinity.mode, themes),
  };
}

// Find the next day (starting today) whose theme opens this cognitive mode.
// Falls back to today if no day in the next two weeks matches — keeps capture
// from disappearing if themes are misconfigured.
export function nextMatchingDay(
  from: Date,
  mode: CognitiveMode,
  themes: WeekThemes,
): string {
  for (let i = 0; i < 14; i++) {
    const d = addDays(from, i);
    if (themes[dayOfWeek(d)].includes(mode)) return toISODate(d);
  }
  return toISODate(from);
}

function guessAffinity(s: string): Affinity {
  if (/(call|phone|ring|dial)/.test(s)) {
    return { mode: "admin", energy: "medium", context: "phone-only", social: "live-with-others" };
  }
  if (/(buy|pick up|drop off|errand|store|shop|grocery|pharmacy|library)/.test(s)) {
    return { mode: "physical", energy: "medium", context: "out-and-about", social: "solo" };
  }
  if (/(draft|write|memo|design|sketch|prototype|brainstorm)/.test(s)) {
    return { mode: "creative", energy: "high", context: "at-desk", social: "solo" };
  }
  if (/(review|read|analyse|analyze|plan|architect|spec)/.test(s)) {
    return { mode: "deep", energy: "high", context: "at-desk", social: "solo" };
  }
  if (/(reply|email|expense|file|submit|invoice|receipt|admin)/.test(s)) {
    return { mode: "admin", energy: "low", context: "at-desk", social: "async-with-others" };
  }
  if (/(clean|laundry|dishes|tidy|fix|repair|filter)/.test(s)) {
    return { mode: "physical", energy: "medium", context: "at-home-anywhere", social: "solo" };
  }
  return { mode: "admin", energy: "low", context: "at-desk", social: "solo" };
}

function guessMinutes(s: string): number {
  if (/(quick|brief|short)/.test(s)) return 10;
  if (/(draft|write|design|review|deep)/.test(s)) return 45;
  return 20;
}

function stripRecurrence(text: string): string {
  return text.replace(/\s+(every\s+\w+|each\s+\w+|weekly|monthly|daily)\b/i, "").trim();
}
