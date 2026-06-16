"use client";

import type { Language } from "@/lib/types";

const LANGS: { id: Language; label: string }[] = [
  { id: "ko", label: "한" },
  { id: "en", label: "EN" },
];

interface Props {
  language: Language;
  onChange: (language: Language) => void;
}

export function LanguageToggle({ language, onChange }: Props) {
  return (
    <div className="glass flex items-center gap-0.5 rounded-full p-1 text-xs font-medium">
      {LANGS.map((l) => {
        const active = l.id === language;
        return (
          <button
            key={l.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(l.id)}
            className={`rounded-full px-2.5 py-1 tabular-nums transition-colors ${
              active ? "glass-pill text-fg" : "text-muted hover:text-fg"
            }`}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
