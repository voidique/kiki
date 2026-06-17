import { countStrokes } from "./hangul";
import type { ContentItem, TestMode, TestResult } from "./types";

const MS_PER_MINUTE = 60_000;
const KO_STROKES_PER_WORD = 3.5;

export interface CharSample {
  atMs: number;
  correct: boolean;
  strokes: number;
}

interface ComputeResultInput {
  content: ContentItem;
  typed: string;
  samples: CharSample[];
  startedAt: number;
  finishedAt: number;
}

export function computeResult(
  input: ComputeResultInput,
  mode: TestMode,
  contentId: string | null,
): TestResult {
  const { content, typed, samples, startedAt, finishedAt } = input;
  const durationMs = Math.max(1, finishedAt - startedAt);
  const minutes = durationMs / MS_PER_MINUTE;

  let correctChars = 0;
  for (let i = 0; i < typed.length; i += 1) {
    if (i < content.text.length && typed[i] === content.text[i]) {
      correctChars += 1;
    }
  }
  const incorrectChars = typed.length - correctChars;

  const correctStrokes = samples.reduce(
    (sum, sample) => (sample.correct ? sum + sample.strokes : sum),
    0,
  );
  const totalStrokes = countStrokes(typed);

  const cpm = correctStrokes / minutes;
  const rawCpm = totalStrokes / minutes;
  const wpm = cpm / KO_STROKES_PER_WORD;
  const accuracy = typed.length === 0 ? 0 : (correctChars / typed.length) * 100;

  return {
    id: createId(),
    userId: null,
    mode,
    language: content.language,
    contentId,
    cpm: round(cpm),
    rawCpm: round(rawCpm),
    wpm: round(wpm),
    accuracy: round(accuracy),
    consistency: round(consistency(samples)),
    durationMs,
    totalStrokes,
    correctChars,
    incorrectChars,
    createdAt: new Date(finishedAt).toISOString(),
  };
}

function consistency(samples: CharSample[]): number {
  const intervals: number[] = [];
  for (let i = 1; i < samples.length; i += 1) {
    const delta = samples[i].atMs - samples[i - 1].atMs;
    if (delta > 0) intervals.push(delta);
  }
  if (intervals.length < 2) return 100;

  const mean =
    intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
  if (mean === 0) return 100;

  const variance =
    intervals.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    intervals.length;
  const coefficientOfVariation = Math.sqrt(variance) / mean;
  return clamp((1 - coefficientOfVariation) * 100, 0, 100);
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `r-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}
