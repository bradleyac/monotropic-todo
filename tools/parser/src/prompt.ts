import { COGNITIVE_MODES, CONTEXTS } from "./types";

// JSON schema passed to Ollama as `format`. Ollama constrains generation
// to match it. `deadline` is a string with internal grammar (token
// vocabulary) that JSON Schema can't easily express, so we keep it loose
// here and validate downstream in dates.ts.
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
    context: { type: "string", enum: CONTEXTS as unknown as string[] },
    estimatedMinutes: { type: "number" },
  },
  required: [
    "title",
    "deadline",
    "deadlineTime",
    "cognitiveMode",
    "context",
    "estimatedMinutes",
  ],
} as const;

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

- cognitiveMode: WHAT KIND OF THINKING the task demands. One of:
    "deep-thinking" — design, analysis, debugging, learning, deep problem-solving requiring uninterrupted focus
    "creative"      — writing, drawing, ideation, anything generative
    "physical"      — manual tasks, chores, errands, exercise — anything whose work is your body, not your mind
    "admin"         — routine paperwork, scheduling, expense reports, low-thought process work
    "social-sync"   — meetings, calls, appointments, in-person conversations (real-time interaction with someone)
    "social-async"  — emails, slack, comments, async replies, drafting messages

- context: WHERE / HOW the task happens. Orthogonal to cognitiveMode. One of:
    "at-desk"       — requires sitting at a computer or desk
    "at-home"       — can be done anywhere at home, no special setup (laundry, dishes, light reading)
    "out-and-about" — requires leaving home (errands, store visits, in-person appointments, shopping)
    "phone-only"    — requires making or taking a phone call (not a video meeting at your desk)

  Choose context by where the body has to be. A dentist appointment is "social-sync" (you're interacting with the hygienist) AND "out-and-about" (you have to drive there). An email is "social-async" AND "at-desk". A call to reschedule something is "social-sync" AND "phone-only".

- estimatedMinutes (number | null): realistic focused-work estimate. Typical ranges: a quick email 5-15, a short errand 30-60, a 1:1 meeting 30, deep design work 60-180.

  Important: If you don't have enough information to provide a ballpark estimate, return null. Never return 0.

Output ONLY the JSON object. No markdown, no prose.`;
}
