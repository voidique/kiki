export type TestMode = "words" | "sentence" | "quote";

export type Language = "ko" | "en";

export interface ContentItem {
  id: string;
  type: TestMode;
  language: Language;
  text: string;
  author?: string | null;
  source?: string | null;
}

export interface TestResult {
  id: string;
  userId: string | null;
  mode: TestMode;
  language: Language;
  contentId: string | null;
  cpm: number;
  rawCpm: number;
  wpm: number;
  accuracy: number;
  consistency: number;
  durationMs: number;
  totalStrokes: number;
  correctChars: number;
  incorrectChars: number;
  createdAt: string;
}

export const MODE_LABELS: Record<TestMode, string> = {
  words: "Words",
  sentence: "Sentence",
  quote: "Quote",
};
