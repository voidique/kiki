"use client";

import { type ContentItem, MODE_LABELS, type TestResult } from "@/lib/types";

interface Props {
  result: TestResult;
  content: ContentItem;
  bestCpm: number;
  onRestart: () => void;
}

export function Results({ result, content, bestCpm, onRestart }: Props) {
  const isBest = result.cpm >= bestCpm && result.cpm > 0;
  const seconds = (result.durationMs / 1000).toFixed(1);

  return (
    <div className="flex w-full max-w-3xl flex-col gap-10">
      {/* 헤드라인: 타수(CPM) */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-faint">
            타수 · CPM
          </span>
          <span className="font-mono text-7xl font-medium tabular-nums leading-none">
            {Math.round(result.cpm)}
          </span>
          <span className="mt-2 text-sm text-muted">
            {isBest ? "개인 최고 기록 · " : `최고 ${Math.round(bestCpm)} · `}
            {MODE_LABELS[result.mode]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-4 font-mono tabular-nums sm:grid-cols-4">
          <Metric label="정확도" value={`${result.accuracy}%`} />
          <Metric label="일관성" value={`${result.consistency}%`} />
          <Metric label="시간" value={`${seconds}s`} />
          <Metric label="WPM" value={String(Math.round(result.wpm))} />
        </div>
      </div>

      {/* 상세 — 칩 형태로 정돈 */}
      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-5">
        <Chip
          label="원시"
          value={`${Math.round(result.rawCpm)}`}
          unit="타/분"
        />
        <Chip label="총 타수" value={`${result.totalStrokes}`} />
        <Chip label="정타" value={`${result.correctChars}`} />
        <Chip label="오타" value={`${result.incorrectChars}`} tone="error" />
        {content.author && (
          <span className="ml-auto text-sm text-muted">— {content.author}</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="glass glass-interactive rounded-full px-6 py-2.5 text-sm text-fg"
        >
          다시 (Enter / Tab)
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[0.65rem] uppercase tracking-widest text-faint">
        {label}
      </span>
      <span className="text-2xl text-fg">{value}</span>
    </div>
  );
}

function Chip({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: "error";
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-full border border-line bg-fg/[0.02] px-3 py-1.5 font-mono text-xs tabular-nums">
      <span className="text-faint">{label}</span>
      <span className={tone === "error" ? "text-error" : "text-fg"}>
        {value}
      </span>
      {unit && <span className="text-faint">{unit}</span>}
    </span>
  );
}
