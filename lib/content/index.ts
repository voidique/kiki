import type { ContentItem, Language, TestMode } from "@/lib/types";
import { EN_QUOTES } from "./en/quotes";
import { EN_SENTENCES } from "./en/sentences";
import { EN_WORDS } from "./en/words";
import { KO_QUOTES } from "./ko/quotes";
import { KO_SENTENCES } from "./ko/sentences";
import { KO_WORDS } from "./ko/words";

export const WORDS_PER_TEST = 25;

const WORDS: Record<Language, string[]> = { ko: KO_WORDS, en: EN_WORDS };
const SENTENCES: Record<Language, ContentItem[]> = {
  ko: KO_SENTENCES,
  en: EN_SENTENCES,
};
const QUOTES: Record<Language, ContentItem[]> = { ko: KO_QUOTES, en: EN_QUOTES };

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 무작위 단어 N개를 공백으로 이어 붙인 지문 */
function buildWords(lang: Language, count: number): ContentItem {
  const pool = WORDS[lang];
  const words: string[] = [];
  for (let i = 0; i < count; i++) words.push(pick(pool));
  return {
    // words 모드는 매번 새로 생성되므로 content_id 는 null (DB 저장 시)
    id: "words-generated",
    type: "words",
    language: lang,
    text: words.join(" "),
    author: null,
  };
}

/** 모드 + 언어에 맞는 새 지문을 만든다. */
export function makeContent(mode: TestMode, lang: Language): ContentItem {
  switch (mode) {
    case "words":
      return buildWords(lang, WORDS_PER_TEST);
    case "sentence":
      return pick(SENTENCES[lang]);
    case "quote":
      return pick(QUOTES[lang]);
  }
}

/** words 모드처럼 즉석 생성된 지문은 DB content_id 가 없다. */
export function contentIdFor(item: ContentItem): string | null {
  return item.id === "words-generated" ? null : item.id;
}
