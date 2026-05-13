import { useMemo, useState } from "react";
import type { Task } from "./types";
import { seedTasks } from "./mockData";
import { planRuns } from "./planner";
import { llmParseDraft, placeDraft } from "./llmParse";
import { planSchedule } from "./scheduler";
import { todayISO } from "./dateUtils";
import { RunsOverview } from "./views/RunsOverview";
import { RunFocus } from "./views/RunFocus";
import { Transition } from "./views/Transition";
import { CaptureBar } from "./views/CaptureBar";
import { DayStrip } from "./views/DayStrip";
import { ValidateTask } from "./views/ValidateTask";

type Screen =
  | { kind: "overview" }
  | { kind: "focus"; runId: string }
  | { kind: "transition"; fromRunId: string | null }
  | { kind: "validate"; draft: Task; originalInput: string };

export function App() {
  const today = useMemo(() => todayISO(), []);
  const [tasks, setTasks] = useState<Task[]>(() =>
    planSchedule(seedTasks, today),
  );
  const [screen, setScreen] = useState<Screen>({ kind: "overview" });
  const [selectedDate, setSelectedDate] = useState<string>(today);

  const tasksById = useMemo(() => {
    const m: Record<string, Task> = {};
    for (const t of tasks) m[t.id] = t;
    return m;
  }, [tasks]);

  const runs = useMemo(
    () => planRuns(tasks, selectedDate),
    [tasks, selectedDate],
  );

  function toggle(taskId: string) {
    setTasks((prev) => {
      const next = prev.map((t) =>
        t.id === taskId ? { ...t, done: !t.done } : t,
      );
      if (screen.kind === "focus") {
        const run = runs.find((r) => r.id === screen.runId);
        if (run && run.taskIds.includes(taskId)) {
          const wasAllDone = run.taskIds.every(
            (id) => prev.find((t) => t.id === id)?.done,
          );
          const isAllDone = run.taskIds.every(
            (id) => next.find((t) => t.id === id)?.done,
          );
          if (isAllDone && !wasAllDone) {
            const runId = run.id;
            setTimeout(
              () => setScreen({ kind: "transition", fromRunId: runId }),
              700,
            );
          }
        }
      }
      return next;
    });
  }

  async function capture(text: string) {
    const draft = await llmParseDraft(text, today);
    setScreen({ kind: "validate", draft, originalInput: text });
  }

  function confirmCapture(final: Task) {
    setTasks((prev) => [...prev, placeDraft(final, prev, today)]);
    setScreen({ kind: "overview" });
  }

  function cancelCapture() {
    setScreen({ kind: "overview" });
  }

  function replan() {
    setTasks((prev) => planSchedule(prev, today));
  }

  function selectDate(date: string) {
    setSelectedDate(date);
    setScreen({ kind: "overview" });
  }

  function enterRun(runId: string) {
    setScreen({ kind: "focus", runId });
  }

  function exitRun() {
    setScreen({ kind: "overview" });
  }

  function nextRunAfter(fromRunId: string | null) {
    if (!fromRunId) return runs[0] ?? null;
    const idx = runs.findIndex((r) => r.id === fromRunId);
    for (let i = idx + 1; i < runs.length; i++) {
      const r = runs[i];
      if (r.taskIds.some((id) => !tasksById[id]?.done)) return r;
    }
    for (const r of runs) {
      if (r.taskIds.some((id) => !tasksById[id]?.done)) return r;
    }
    return null;
  }

  let body;
  if (screen.kind === "overview") {
    body = (
      <>
        <DayStrip
          selected={selectedDate}
          today={today}
          tasks={tasks}
          onSelect={selectDate}
        />
        <RunsOverview
          runs={runs}
          tasks={tasksById}
          selectedDate={selectedDate}
          today={today}
          onEnterRun={enterRun}
          onReplan={replan}
        />
      </>
    );
  } else if (screen.kind === "focus") {
    const run = runs.find((r) => r.id === screen.runId);
    if (!run) {
      body = (
        <>
          <DayStrip
            selected={selectedDate}
            today={today}
            tasks={tasks}
            onSelect={selectDate}
          />
          <RunsOverview
            runs={runs}
            tasks={tasksById}
            selectedDate={selectedDate}
            today={today}
            onEnterRun={enterRun}
            onReplan={replan}
          />
        </>
      );
    } else {
      body = (
        <RunFocus
          run={run}
          tasks={tasksById}
          onToggle={toggle}
          onExit={exitRun}
        />
      );
    }
  } else if (screen.kind === "transition") {
    const from = screen.fromRunId
      ? runs.find((r) => r.id === screen.fromRunId) ?? null
      : null;
    const to = nextRunAfter(screen.fromRunId);
    body = (
      <Transition
        from={from}
        to={to}
        tasks={tasksById}
        onBegin={() => to && setScreen({ kind: "focus", runId: to.id })}
        onBackToOverview={() => setScreen({ kind: "overview" })}
      />
    );
  } else {
    body = (
      <ValidateTask
        draft={screen.draft}
        originalInput={screen.originalInput}
        onConfirm={confirmCapture}
        onCancel={cancelCapture}
      />
    );
  }

  return (
    <div className="app">
      <main className="main">{body}</main>
      {screen.kind === "overview" && <CaptureBar onCapture={capture} />}
    </div>
  );
}
