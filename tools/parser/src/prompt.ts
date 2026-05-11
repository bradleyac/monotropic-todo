import { COGNITIVE_MODES } from "./types";

// JSON schema passed to Ollama as `format`. Ollama constrains generation
// to match it, so we get well-formed JSON back without retries or fragile
// parsing. `deadline` is a string with internal grammar (token vocabulary)
// that JSON Schema can't easily express, so we keep it loose here and
// validate downstream in dates.ts.
export const TASK_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    deadline: { type: ["string", "null"] },
    deadlineTime: { type: ["string", "null"] },
    cognitiveMode: {
      type: "string",
      enum: COGNITIVE_MODES as unknown as string[],
    },
    estimatedMinutes: { type: "number" },
  },
  required: [
    "title",
    "deadline",
    "deadlineTime",
    "cognitiveMode",
    "estimatedMinutes",
  ],
} as const;

// The model emits a symbolic deadline token; resolveDeadline() in dates.ts
// turns it into an ISO date. This avoids asking the LLM to do day-of-week
// arithmetic, which it gets wrong (it was resolving "Tuesday" from Monday
// 2026-05-11 to 2026-05-19 — next-week semantics, plus the model has no
// reliable way to compute weekday from a bare ISO date).
export function systemPrompt(today: string): string {
  return `Today is ${today}.

You extract structured task data from short natural-language task descriptions.

Return a JSON object with these fields:

- title (string): short imperative phrase (3-8 words). Strip filler ("I need to", "remember to") and trailing deadline phrases.

- deadline (string | null): a SYMBOLIC TOKEN. Do NOT compute a calendar date. Emit one of these exact tokens, and the application will resolve the date:
    null                           when no deadline is mentioned
    "today"                        user said "today"
    "tomorrow"                     user said "tomorrow"
    "monday" .. "sunday"           user named a weekday ("Friday", "by Tuesday", "on Thursday")
    "next-monday" .. "next-sunday" user said "next <weekday>" explicitly
    "MM-DD"                        user gave a month + day with no year (e.g. "May 15", "February 3rd", "12/25"). Two-digit month and day, zero-padded.
    "YYYY-MM-DD"                   user gave an explicit year too (e.g. "May 15 2027").

  Important: do not translate weekdays or month+day into a full date. If the user says "Tuesday", emit "tuesday". If they say "February 3rd", emit "02-03". The application picks the right week/year (always the next occurrence forward) so you don't have to.

- deadlineTime (string | null): "HH:mm" 24-hour, when a specific time is mentioned. Otherwise null.
    "3pm"     -> "15:00"
    "9:30am"  -> "09:30"
    no time   -> null

- cognitiveMode: one of:
    - "deep-thinking" — design, analysis, debugging, learning, deep problem-solving requiring uninterrupted focus
    - "creative"      — writing, drawing, ideation, anything generative
    - "physical"      — errands, chores, manual tasks, exercise, being somewhere or moving your body
    - "admin"         — routine paperwork, scheduling, expense reports, low-thought process work
    - "social-sync"   — meetings, calls, in-person conversations (real-time)
    - "social-async"  — emails, slack, comments, async replies, drafting messages

- estimatedMinutes (number): realistic focused-work estimate. Typical ranges: a quick email 5-15, a short errand 30-60, a 1:1 meeting 30, deep design work 60-180.

Output ONLY the JSON object. No markdown, no prose.`;
}
