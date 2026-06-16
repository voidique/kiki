"use client";

import { MODE_LABELS, type TestMode } from "@/lib/types";

const MODES: TestMode[] = ["words", "sentence", "quote"];

interface Props {
  mode: TestMode;
  onChange: (mode: TestMode) => void;
}

export function ModeTabs({ mode, onChange }: Props) {
  return (
    <div className="glass flex items-center gap-1 rounded-full p-1 text-sm">
      {MODES.map((m) => {
        const active = m === mode;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={`rounded-full px-4 py-1.5 tracking-tight transition-colors ${
              active ? "glass-pill text-fg" : "text-muted hover:text-fg"
            }`}
          >
            {MODE_LABELS[m]}
          </button>
        );
      })}
    </div>
  );
}
