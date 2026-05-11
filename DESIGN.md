# monotropic-todo — Design

A todo app tuned for monotropic cognition: minds that work best with sustained
single-focus and pay a steep cost for context-switching. Most todo apps treat
tasks as a flat list and leave the user to decide what to do next. That
decision is the expensive part, and it's where monotropic users lose the
day.

## Core idea

Tag each task with a small set of **affinity dimensions** describing the
*shape* of doing it (not what it's about). The planner then groups today's
tasks into **runs** — contiguous blocks of high-affinity tasks that share a
cognitive shape, so a user can stay in one mode for the whole run. Transitions
between runs are explicit, named, and protected.

## Affinity dimensions (4, preset enums)

Fixed taxonomy — no custom values. Predictable, so the bundler can reason
about transition cost as a small distance function.

1. **Cognitive mode** — `deep` / `admin` / `creative` / `physical` / `social`
2. **Energy required** — `high` / `medium` / `low`
3. **Context** — `at-desk` / `at-home-anywhere` / `out-and-about` / `phone-only`
4. **Social demand** — `solo` / `async-with-others` / `live-with-others`

Switching cost is the weighted sum of dimension changes between adjacent
tasks. The planner minimises total switching cost across the day subject to
deadlines and required maintenance windows.

## Capture: natural-language quick-add

Single text field. An LLM parser extracts:

- title, optional notes
- recurrence ("every month", "every other Tuesday")
- deadline / maintenance window
- proposed affinity values

The parser proposes; the user can correct inline. Re-prompts are cheap —
correcting "this is creative not admin" once teaches the user's calibration
for similar phrasings (stored as few-shot examples, not a fine-tune).

## Day shape

- **Morning**: today's runs view. 2–4 runs, each labelled by its dominant
  affinity ("deep solo morning", "low-energy admin", "errands out").
- **Inside a run**: only that run's tasks are visible. No sidebar, no badges,
  no inbox. The point is to remove decisions.
- **Between runs**: a transition card naming the next run's shape and a
  one-line "shift" prompt (e.g. "stand up, water, then phone tasks"). User
  taps to begin, or snoozes the transition.

## Notifications: transition-aware nudges

- Silent during a run.
- At the planned end of a run, a gentle nudge: "this run is done — next is
  X". The nudge is the *only* notification by default.
- Risk alerts (deadline slipping, maintenance window closing) override
  silence, but only if the planner can't reshuffle to fix it.
- No streaks, no badges, no daily totals.

## Bundling rules of thumb

- A run is 30–120 min of tasks sharing cognitive mode and social demand.
- Energy descends across the day by default (high → low), unless the user's
  observed pattern says otherwise.
- Context changes (e.g. desk → out) always become run boundaries.
- Recurring maintenance tasks ("clean filter monthly") get folded into the
  nearest compatible run rather than scheduled to a date, unless they have
  a hard window.

## Out of scope (v1)

- Calendar integration (deferred). The app's day view is the source of truth.
- Sharing / assignment / team features.
- Streaks, gamification, analytics dashboards.
- Custom affinity values (kept fixed so bundling stays predictable).

## Open questions for later

- How aggressive should the planner be about reshuffling mid-day when a run
  overruns? Default: ask, don't auto-reshuffle.
- Should "shift" prompts be user-editable per cognitive-mode pair?
- Voice capture as a later addition (good for hands-busy households).
