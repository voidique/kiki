import { countStrokes } from "./hangul";
import type { ContentItem, Language, TestMode, TestResult } from "./types";

const MS_PER_MIN = 60_000;

export interface CharSample {
  /** 이 글자를 "확정"한 시점의 경과 시간(ms) */
  atMs: number;
  correct: boolean;
  /** 해당 글자의 타수 */
  strokes: number;
}

export interface ComputeInput {
  content: ContentItem;
  /** 사용자가 최종 입력한 문자열 (확정분) */
  typed: string;
  /** 글자별 표본 (일관성/타수 계산용) */
  samples: CharSample[];
  startedAt: number;
  finishedAt: number;
}

/**
 * 표준편차 기반 일관성(consistency) — 글자 간 입력 간격의 변동이 작을수록 100 에 가깝다.
 * monkeytype 의 consistency 와 유사한 개념.
 */
function consistencyFromSamples(samples: CharSample[]): number {
  if (samples.length < 2) return 100;
  const intervals: number[] = [];
  for (let i = 1; i < samples.length; i++) {
    const dt = samples[i].atMs - samples[i - 1].atMs;
    if (dt > 0) intervals.push(dt);
  }
  if (intervals.length < 2) return 100;
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  if (mean === 0) return 100;
  const variance =
    intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / intervals.length;
  const cov = Math.sqrt(variance) / mean; // 변동계수
  return Math.max(0, Math.min(100, (1 - cov) * 100));
}

export function computeResult(
  input: ComputeInput,
  mode: TestMode,
  contentId: string | null,
): TestResult {
  const { content, typed, samples, startedAt, finishedAt } = input;
  const durationMs = Math.max(1, finishedAt - startedAt);
  const minutes = durationMs / MS_PER_MIN;

  const target = content.text;
  let correctChars = 0;
  let incorrectChars = 0;
  for (let i = 0; i < typed.length; i++) {
    if (i < target.length && typed[i] === target[i]) correctChars++;
    else incorrectChars++;
  }

  // 정타 글자만 모은 문자열의 타수 / 전체 입력 타수
  const correctStrokes = samples
    .filter((s) => s.correct)
    .reduce((a, s) => a + s.strokes, 0);
  const totalStrokes = countStrokes(typed);

  const cpm = correctStrokes / minutes; // 정타 기준 타수/분
  const rawCpm = totalStrokes / minutes; // 오타 포함 원시 타수/분
  // 한글 평균 어절(단어)을 ~3.5타로 보고 영문식 WPM 근사 (보조 지표)
  const wpm = cpm / 3.5;

  const total = correctChars + incorrectChars;
  const accuracy = total === 0 ? 0 : (correctChars / total) * 100;

  return {
    id: cryptoRandomId(),
    userId: null,
    mode,
    language: content.language as Language,
    contentId,
    cpm: round(cpm),
    rawCpm: round(rawCpm),
    wpm: round(wpm),
    accuracy: round(accuracy),
    consistency: round(consistencyFromSamples(samples)),
    durationMs,
    totalStrokes,
    correctChars,
    incorrectChars,
    createdAt: new Date(finishedAt).toISOString(),
  };
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `r-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}
