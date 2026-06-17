import type { Language, TestMode, TestResult } from "./types";

const RESULTS_KEY = "kiki.results.v1";
const PREFS_KEY = "kiki.prefs.v1";
const MAX_RESULTS = 500;

export interface Prefs {
  language: Language;
  mode: TestMode;
}

export function loadResults(): TestResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RESULTS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as TestResult[]) : [];
  } catch {
    return [];
  }
}

export function saveResult(result: TestResult): TestResult[] {
  const next = [result, ...loadResults()].slice(0, MAX_RESULTS);
  persist(RESULTS_KEY, next);
  return next;
}

export function bestCpm(
  mode: TestMode,
  language: Language,
  results = loadResults(),
): number {
  return results
    .filter((result) => result.mode === mode && result.language === language)
    .reduce((max, result) => Math.max(max, result.cpm), 0);
}

export function loadPrefs(): Partial<Prefs> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    return raw ? (JSON.parse(raw) as Partial<Prefs>) : {};
  } catch {
    return {};
  }
}

export function savePrefs(prefs: Prefs): void {
  persist(PREFS_KEY, prefs);
}

function persist(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}
