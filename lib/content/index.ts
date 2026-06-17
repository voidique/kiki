import type { ContentItem, Language, TestMode } from "@/lib/types";
import { EN_QUOTES } from "./en/quotes";
import { EN_SENTENCES } from "./en/sentences";
import { EN_WORDS } from "./en/words";
import { KO_QUOTES } from "./ko/quotes";
import { KO_SENTENCES } from "./ko/sentences";
import { KO_WORDS } from "./ko/words";

const WORDS_PER_TEST = 25;
const GENERATED_WORDS_ID = "words-generated";

const WORDS: Record<Language, string[]> = { ko: KO_WORDS, en: EN_WORDS };
const SENTENCES: Record<Language, ContentItem[]> = {
  ko: KO_SENTENCES,
  en: EN_SENTENCES,
};
const QUOTES: Record<Language, ContentItem[]> = {
  ko: KO_QUOTES,
  en: EN_QUOTES,
};

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function buildWords(language: Language): ContentItem {
  const pool = WORDS[language];
  const words = Array.from({ length: WORDS_PER_TEST }, () => pick(pool));
  return {
    id: GENERATED_WORDS_ID,
    type: "words",
    language,
    text: words.join(" "),
    author: null,
  };
}

export function makeContent(mode: TestMode, language: Language): ContentItem {
  switch (mode) {
    case "words":
      return buildWords(language);
    case "sentence":
      return pick(SENTENCES[language]);
    case "quote":
      return pick(QUOTES[language]);
  }
}

export function contentIdFor(item: ContentItem): string | null {
  return item.id === GENERATED_WORDS_ID ? null : item.id;
}
