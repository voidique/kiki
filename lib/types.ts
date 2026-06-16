/*
 * 데이터 모델 — 지금은 localStorage 로 저장하지만,
 * 향후 PostgreSQL 로 옮길 것을 전제로 테이블 row 모양 그대로 설계한다.
 *
 * 예정 스키마 (참고):
 *
 *   create table content (
 *     id          text primary key,
 *     type        text not null,            -- 'words' | 'sentence' | 'quote'
 *     language    text not null default 'ko',
 *     text        text not null,
 *     author      text,                     -- quote 의 출처 인물
 *     source      text
 *   );
 *
 *   create table test_results (
 *     id               uuid primary key default gen_random_uuid(),
 *     user_id          uuid references users(id),   -- null = 익명/로컬
 *     mode             text not null,               -- 'words' | 'sentence' | 'quote'
 *     language         text not null default 'ko',
 *     content_id       text references content(id), -- words 모드는 null 가능
 *     cpm              real not null,               -- 타수/분 (한글 기본 지표)
 *     raw_cpm          real not null,               -- 오타 포함 원시 타수
 *     wpm              real not null,               -- 영문식 보조 지표
 *     accuracy         real not null,               -- 0~100
 *     consistency      real not null,               -- 0~100
 *     duration_ms      integer not null,
 *     total_strokes    integer not null,            -- 입력한 총 자모 타수
 *     correct_chars    integer not null,            -- 정타 글자 수
 *     incorrect_chars  integer not null,            -- 오타 글자 수
 *     created_at       timestamptz not null default now()
 *   );
 */

export type TestMode = "words" | "sentence" | "quote";

export type Language = "ko" | "en";

/** content 테이블 한 행에 대응 */
export interface ContentItem {
  id: string;
  type: TestMode;
  language: Language;
  text: string;
  author?: string | null;
  source?: string | null;
}

/** test_results 테이블 한 행에 대응 */
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
  createdAt: string; // ISO 8601
}

export const MODE_LABELS: Record<TestMode, string> = {
  words: "Words",
  sentence: "Sentence",
  quote: "Quote",
};
