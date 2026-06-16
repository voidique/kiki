import type { Language, TestMode, TestResult } from "./types";

/*
 * 로컬 저장소 — 향후 PostgreSQL `test_results` 테이블로 그대로 옮길 수 있도록
 * row 배열 형태로 보관한다. 마이그레이션 시엔 이 배열을 그대로 INSERT 하면 된다.
 */
const KEY = "kiki.results.v1";
const MAX_ROWS = 500;

export function loadResults(): TestResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TestResult[]) : [];
  } catch {
    return [];
  }
}

export function saveResult(result: TestResult): TestResult[] {
  const rows = loadResults();
  rows.unshift(result);
  const trimmed = rows.slice(0, MAX_ROWS);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    /* 저장 실패는 조용히 무시 (시크릿 모드 등) */
  }
  return trimmed;
}

/** 해당 모드 + 언어의 개인 최고 타수(cpm) */
export function bestCpm(
  mode: TestMode,
  language: Language,
  rows = loadResults(),
): number {
  return rows
    .filter((r) => r.mode === mode && r.language === language)
    .reduce((max, r) => Math.max(max, r.cpm), 0);
}

export function clearResults(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

/* ── 사용자 선택(언어·모드) 저장 — 새로고침해도 유지 ───────────── */
const PREFS_KEY = "kiki.prefs.v1";

export interface Prefs {
  language: Language;
  mode: TestMode;
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
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* noop */
  }
}
