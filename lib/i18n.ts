import type { Language } from "./types";

export const STRINGS = {
  ko: {
    startTyping: "타이핑을 시작하세요",
    clickToStart: "클릭하면 시작",
    newText: "새 지문",
    focusArea: "타이핑 영역에 집중",
    cpm: "타수",
    accuracy: "정확도",
    time: "시간",
    consistency: "일관성",
    wpm: "WPM",
    cpmHeading: "타수 · CPM",
    raw: "원시",
    rawUnit: "타/분",
    totalStrokes: "총 타수",
    correct: "정타",
    incorrect: "오타",
    personalBest: "개인 최고 기록",
    best: "최고",
    restart: "다시 (Enter / Tab)",
  },
  en: {
    startTyping: "Start typing",
    clickToStart: "Click to start",
    newText: "new test",
    focusArea: "Focus the typing area",
    cpm: "cpm",
    accuracy: "acc",
    time: "time",
    consistency: "consistency",
    wpm: "wpm",
    cpmHeading: "CPM",
    raw: "raw",
    rawUnit: "/min",
    totalStrokes: "strokes",
    correct: "correct",
    incorrect: "errors",
    personalBest: "Personal best",
    best: "best",
    restart: "Restart (Enter / Tab)",
  },
} as const;

export type Strings = (typeof STRINGS)[Language];

export function strings(language: Language): Strings {
  return STRINGS[language];
}
