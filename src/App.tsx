import { useMemo, useState } from "react";
import type { Task } from "./types";
import { seedTasks } from "./mockData";
import { planRuns } from "./planner";
import { mockParse } from "./parser";
import { RunsOverview } from "./views/RunsOverview";
import { RunFocus } from "./views/RunFocus";
import { Transition } from "./views/Transition";
import { CaptureBar } from "./views/CaptureBar";

type Screen =
  | { kind: "overview" }
  | { kind: "focus"; runId: string }
  | { kind: "transition"; fromRunId: string | null };

export function App() {
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [screen, setScreen] = useState<Screen>({ kind: "overview" });

  const tasksById = useMemo(() => {
    const m: Record<string, Task> = {};
    for (const t of tasks) m[t.id] = t;
    return m;
  }, [tasks]);

  const runs = useMemo(() => planRuns(tasks), [tasks]);

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

  function capture(text: string) {
    setTasks((prev) => [...prev, mockParse(text)]);
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
      <RunsOverview runs={runs} tasks={tasksById} onEnterRun={enterRun} />
    );
  } else if (screen.kind === "focus") {
    const run = runs.find((r) => r.id === screen.runId);
    if (!run) {
      body = (
        <RunsOverview runs={runs} tasks={tasksById} onEnterRun={enterRun} />
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
  } else {
    const from = screen.fromRunId
      ? runs.find((r) => r.id === screen.fromRunId) ?? null
      : null;
    const to = nextRunAfter(screen.fromRunId);
    body = (
      <Transition
        from={from}
        to={to}
        onBegin={() => to && setScreen({ kind: "focus", runId: to.id })}
        onBackToOverview={() => setScreen({ kind: "overview" })}
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
