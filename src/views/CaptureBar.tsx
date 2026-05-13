import { useState } from "react";

type Props = {
  onCapture: (text: string) => Promise<void>;
};

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

export function CaptureBar({ onCapture }: Props) {
  const [text, setText] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = text.trim();
    if (!v || state.kind === "loading") return;
    setState({ kind: "loading" });
    try {
      await onCapture(v);
      setText("");
      setState({ kind: "idle" });
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Couldn't parse that — try again?";
      setState({ kind: "error", message });
    }
  }

  return (
    <form className="capture" onSubmit={submit}>
      <input
        className="capture-input"
        placeholder={
          state.kind === "loading"
            ? "parsing…"
            : 'add task — e.g. "buy coffee filters" or "draft Q2 memo"'
        }
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (state.kind === "error") setState({ kind: "idle" });
        }}
        disabled={state.kind === "loading"}
      />
      {state.kind === "error" && (
        <div className="capture-error">{state.message}</div>
      )}
    </form>
  );
}
