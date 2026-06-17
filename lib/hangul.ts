const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
const MEDIAL_COUNT = 21;
const FINAL_COUNT = 28;

const COMPLEX_MEDIALS = new Set([9, 10, 11, 14, 15, 16, 19]);
const COMPLEX_FINALS = new Set([3, 5, 6, 9, 10, 11, 12, 13, 14, 15, 18]);

export function strokesOfChar(char: string): number {
  const code = char.codePointAt(0);
  if (code === undefined) return 0;
  if (code < HANGUL_START || code > HANGUL_END) return 1;

  const offset = code - HANGUL_START;
  const medial = Math.floor(
    (offset % (MEDIAL_COUNT * FINAL_COUNT)) / FINAL_COUNT,
  );
  const final = offset % FINAL_COUNT;

  let strokes = 1 + (COMPLEX_MEDIALS.has(medial) ? 2 : 1);
  if (final > 0) strokes += COMPLEX_FINALS.has(final) ? 2 : 1;
  return strokes;
}

export function countStrokes(text: string): number {
  let total = 0;
  for (const char of text) total += strokesOfChar(char);
  return total;
}
