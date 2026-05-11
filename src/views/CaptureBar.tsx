import { useState } from "react";

type Props = {
  onCapture: (text: string) => void;
};

export function CaptureBar({ onCapture }: Props) {
  const [text, setText] = useState("");
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    onCapture(v);
    setText("");
  }
  return (
    <form className="capture" onSubmit={submit}>
      <input
        className="capture-input"
        placeholder='add task — e.g. "buy coffee filters" or "draft Q2 memo"'
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </form>
  );
}
