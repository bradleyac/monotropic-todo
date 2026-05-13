import { useMemo, useState } from "react";
import { SingleShot } from "./components/SingleShot";
import { EvalRunner } from "./components/EvalRunner";
import { DEFAULT_MODEL } from "./parser";

type Tab = "parse" | "evals";

export function App() {
  const [tab, setTab] = useState<Tab>("parse");
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const model = DEFAULT_MODEL;

  return (
    <div className="app">
      <header className="app-header">
        <h1>task parser</h1>
        <div className="app-meta">
          <span className="chip">{model}</span>
          <span className="chip">today: {today}</span>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={tab === "parse" ? "tab tab-active" : "tab"}
          onClick={() => setTab("parse")}
        >
          parse
        </button>
        <button
          className={tab === "evals" ? "tab tab-active" : "tab"}
          onClick={() => setTab("evals")}
        >
          evals
        </button>
      </nav>

      {tab === "parse" ? (
        <SingleShot today={today} model={model} />
      ) : (
        <EvalRunner model={model} />
      )}
    </div>
  );
}
