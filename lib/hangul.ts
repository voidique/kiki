/*
 * 한글 자모 분해 유틸 — "타수"(타자 수) 계산용.
 *
 * 한글 타자 속도는 영문 WPM 보다 "타수/분(CPM)" 이 표준 지표다.
 * 한 글자를 누른 자모(키) 수로 환산해야 하므로, 음절을 초성/중성/종성으로
 * 분해하고 겹자모(ㅘ, ㄳ 등)는 다시 풀어 스트로크 수를 센다.
 *
 *   "안녕" → ㅇㅏㄴ + ㄴㅕㅇ = 6 타
 *   "왔다" → ㅇㅗㅏㅆ(=ㅇ+ㅗ+ㅏ+ㅆ) + ㄷㅏ ... 등
 */

const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;

const CHO = 19; // 초성 종류
const JUNG = 21; // 중성 종류
const JONG = 28; // 종성 종류(0 = 받침 없음)

// 겹중성 → 단모음 분해 (스트로크 수만 필요하므로 길이만 의미 있음)
const JUNG_DECOMPOSE: Record<number, number> = {
  // index 기준 (ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ)
  9: 2, // ㅘ = ㅗ+ㅏ
  10: 2, // ㅙ = ㅗ+ㅐ
  11: 2, // ㅚ = ㅗ+ㅣ
  14: 2, // ㅝ = ㅜ+ㅓ
  15: 2, // ㅞ = ㅜ+ㅔ
  16: 2, // ㅟ = ㅜ+ㅣ
  19: 2, // ㅢ = ㅡ+ㅣ
};

// 겹받침 → 단자음 분해 (index 기준, 0 = 없음)
const JONG_DECOMPOSE: Record<number, number> = {
  3: 2, // ㄳ
  5: 2, // ㄵ
  6: 2, // ㄶ
  9: 2, // ㄺ
  10: 2, // ㄻ
  11: 2, // ㄼ
  12: 2, // ㄽ
  13: 2, // ㄾ
  14: 2, // ㄿ
  15: 2, // ㅀ
  18: 2, // ㅄ
};

/** 한 글자(음절/자모/기타)의 타수를 센다. 비한글 문자는 1타로 친다. */
export function strokesOfChar(ch: string): number {
  const code = ch.codePointAt(0);
  if (code === undefined) return 0;

  // 완성형 음절
  if (code >= HANGUL_BASE && code <= HANGUL_END) {
    const offset = code - HANGUL_BASE;
    const jong = offset % JONG;
    const jung = Math.floor((offset % (JUNG * JONG)) / JONG);

    let strokes = 1; // 초성 1타 (쌍자음도 shift 조합이라 1타로 계산)
    strokes += JUNG_DECOMPOSE[jung] ?? 1; // 중성
    if (jong > 0) strokes += JONG_DECOMPOSE[jong] ?? 1; // 종성
    return strokes;
  }

  // 호환 자모 단독 입력(ㄱ, ㅏ 등)도 1타
  return 1;
}

/** 문자열 전체 타수 */
export function countStrokes(text: string): number {
  let total = 0;
  for (const ch of text) total += strokesOfChar(ch);
  return total;
}

/** 조합 중인 미완성 음절인지 (받침/모음이 더 붙을 수 있는 상태) — UI 판정 보조용 */
export function isHangulSyllable(ch: string): boolean {
  const code = ch.codePointAt(0);
  return code !== undefined && code >= HANGUL_BASE && code <= HANGUL_END;
}
