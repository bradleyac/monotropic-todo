import { COGNITIVE_MODES } from "./types";

// JSON schema passed to Ollama as `format`. Ollama constrains generation to
// match this schema, so we get well-formed JSON back without retries or
// fragile regex parsing.
export const TASK_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    deadline: { type: ["string", "null"] },
    cognitiveMode: { type: "string", enum: COGNITIVE_MODES as unknown as string[] },
    estimatedMinutes: { type: "number" },
  },
  required: ["title", "deadline", "cognitiveMode", "estimatedMinutes"],
} as const;

export function systemPrompt(today: string): string {
  return `You extract structured task data from short natural-language task descriptions.

Today's date is ${today}. Resolve relative dates ("tomorrow", "Friday", "next week") against this date. Weeks start Monday; "this Friday" means the Friday of the current week, "next Friday" the following one.

Return a JSON object with these fields:

- title: a short imperative phrase capturing the action (3-8 words). Strip filler ("I need to", "remember to") and trailing deadline phrases.
- deadline: ISO 8601 string, or null.
    - Use "YYYY-MM-DD" when a date is specified without a time.
    - Use "YYYY-MM-DDTHH:mm" (local time, 24-hour) when a specific time is mentioned.
    - Use null when no deadline is implied.
- cognitiveMode: one of:
    - "deep-thinking" — design, analysis, debugging, learning, deep problem-solving requiring uninterrupted focus
    - "creative" — writing, drawing, ideation, anything generative
    - "physical" — errands, chores, manual tasks, exercise, anything requiring being somewhere or moving your body
    - "admin" — routine paperwork, scheduling, expense reports, low-thought process work
    - "social-sync" — meetings, calls, in-person conversations (real-time)
    - "social-async" — emails, slack, comments, async replies, drafting messages
- estimatedMinutes: realistic focused-work estimate in minutes. Typical ranges: a quick email 5-15, a short errand 30-60, a 1:1 meeting 30, deep design work 60-180.

Output ONLY the JSON object. No markdown, no prose.`;
}
