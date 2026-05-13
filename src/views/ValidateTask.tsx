import { useState } from "react";
import type {
  Affinity,
  CognitiveMode,
  Context,
  Energy,
  SocialDemand,
  Task,
} from "../types";

type Props = {
  draft: Task;
  originalInput: string;
  onConfirm: (final: Task) => void;
  onCancel: () => void;
};

type DeadlineKind = "none" | "due-by" | "at";

const MODE_OPTIONS: { value: CognitiveMode; label: string }[] = [
  { value: "deep", label: "deep" },
  { value: "creative", label: "creative" },
  { value: "admin", label: "admin" },
  { value: "social", label: "social" },
  { value: "physical", label: "physical" },
];

const CONTEXT_OPTIONS: { value: Context; label: string }[] = [
  { value: "at-desk", label: "at-desk" },
  { value: "at-home-anywhere", label: "at-home" },
  { value: "out-and-about", label: "out-and-about" },
  { value: "phone-only", label: "phone-only" },
];

const ENERGY_OPTIONS: { value: Energy; label: string }[] = [
  { value: "high", label: "high" },
  { value: "medium", label: "medium" },
  { value: "low", label: "low" },
];

const SOCIAL_OPTIONS: { value: SocialDemand; label: string }[] = [
  { value: "solo", label: "solo" },
  { value: "async-with-others", label: "async" },
  { value: "live-with-others", label: "live" },
];

export function ValidateTask({ draft, originalInput, onConfirm, onCancel }: Props) {
  const [title, setTitle] = useState(draft.title);
  const [estMinutes, setEstMinutes] = useState<string>(String(draft.estMinutes));
  const [affinity, setAffinity] = useState<Affinity>(draft.affinity);
  const initialKind: DeadlineKind = draft.at ? "at" : draft.dueBy ? "due-by" : "none";
  const [deadlineKind, setDeadlineKind] = useState<DeadlineKind>(initialKind);
  const [dueBy, setDueBy] = useState<string>(draft.dueBy ?? "");
  // datetime-local needs "YYYY-MM-DDTHH:mm"; draft.at is exactly that shape.
  const [at, setAt] = useState<string>(draft.at ?? "");

  function confirm(e: React.FormEvent) {
    e.preventDefault();
    const minutes = Number(estMinutes);
    const final: Task = {
      ...draft,
      title: title.trim() || draft.title,
      estMinutes: Number.isFinite(minutes) && minutes > 0 ? minutes : draft.estMinutes,
      affinity,
    };
    if (deadlineKind === "at" && at) {
      final.at = at;
      delete final.dueBy;
    } else if (deadlineKind === "due-by" && dueBy) {
      final.dueBy = dueBy;
      delete final.at;
    } else {
      delete final.at;
      delete final.dueBy;
    }
    onConfirm(final);
  }

  return (
    <section className="validate">
      <p className="eyebrow">confirm task</p>
      <p className="validate-original muted">“{originalInput}”</p>
      <form className="validate-form" onSubmit={confirm}>
        <label className="validate-field">
          <span className="validate-label">title</span>
          <input
            className="validate-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </label>

        <label className="validate-field">
          <span className="validate-label">est. minutes</span>
          <input
            className="validate-input validate-input-short"
            type="number"
            min={1}
            value={estMinutes}
            onChange={(e) => setEstMinutes(e.target.value)}
          />
        </label>

        <ChipGroup
          label="mode"
          options={MODE_OPTIONS}
          value={affinity.mode}
          onChange={(v) => setAffinity({ ...affinity, mode: v })}
        />
        <ChipGroup
          label="context"
          options={CONTEXT_OPTIONS}
          value={affinity.context}
          onChange={(v) => setAffinity({ ...affinity, context: v })}
        />
        <ChipGroup
          label="energy"
          options={ENERGY_OPTIONS}
          value={affinity.energy}
          onChange={(v) => setAffinity({ ...affinity, energy: v })}
        />
        <ChipGroup
          label="social"
          options={SOCIAL_OPTIONS}
          value={affinity.social}
          onChange={(v) => setAffinity({ ...affinity, social: v })}
        />

        <ChipGroup
          label="deadline"
          options={[
            { value: "none", label: "none" },
            { value: "due-by", label: "due by" },
            { value: "at", label: "at" },
          ]}
          value={deadlineKind}
          onChange={(v) => setDeadlineKind(v)}
        />
        {deadlineKind === "due-by" && (
          <label className="validate-field">
            <span className="validate-label">date</span>
            <input
              className="validate-input"
              type="date"
              value={dueBy}
              onChange={(e) => setDueBy(e.target.value)}
            />
          </label>
        )}
        {deadlineKind === "at" && (
          <label className="validate-field">
            <span className="validate-label">when</span>
            <input
              className="validate-input"
              type="datetime-local"
              value={at}
              onChange={(e) => setAt(e.target.value)}
            />
          </label>
        )}

        <div className="validate-actions">
          <button type="submit" className="primary">
            add task
          </button>
          <button type="button" className="link" onClick={onCancel}>
            cancel
          </button>
        </div>
      </form>
    </section>
  );
}

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="validate-field">
      <span className="validate-label">{label}</span>
      <div className="validate-chips">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`validate-chip ${value === opt.value ? "selected" : ""}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
