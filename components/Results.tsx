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

      {/* 상세 */}
      <div className="flex flex-wrap gap-x-8 gap-y-2 border-t border-line pt-4 font-mono text-xs text-muted tabular-nums">
        <span>원시 {Math.round(result.rawCpm)} 타/분</span>
        <span>총 {result.totalStrokes} 타</span>
        <span className="text-fg">정타 {result.correctChars}</span>
        <span className="text-error">오타 {result.incorrectChars}</span>
        {content.author && <span>— {content.author}</span>}
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
