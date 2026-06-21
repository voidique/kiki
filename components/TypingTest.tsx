"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { contentIdFor, makeContent } from "@/lib/content";
import { strokesOfChar } from "@/lib/hangul";
import { strings } from "@/lib/i18n";
import { soundEngine } from "@/lib/sound";
import { type CharSample, computeResult } from "@/lib/stats";
import type { ContentItem, Language, TestMode, TestResult } from "@/lib/types";
import { LiveStats } from "./LiveStats";
import { Results } from "./Results";

type Status = "idle" | "running" | "done";

interface TypingTestProps {
  mode: TestMode;
  language: Language;
  bestCpm: number;
  onResult: (result: TestResult) => void;
}

export function TypingTest({
  mode,
  language,
  bestCpm,
  onResult,
}: TypingTestProps) {
  const t = strings(language);
  const [content, setContent] = useState<ContentItem | null>(null);
  const [typed, setTyped] = useState("");
  const [composing, setComposing] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<TestResult | null>(null);
  const [focused, setFocused] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const startedAtRef = useRef(0);
  const samplesRef = useRef<CharSample[]>([]);
  const committedRef = useRef(0);

  const target = content?.text ?? "";

  const reset = useCallback(() => {
    setContent(makeContent(mode, language));
    setTyped("");
    setComposing(false);
    setStatus("idle");
    setResult(null);
    samplesRef.current = [];
    committedRef.current = 0;
    startedAtRef.current = 0;
    requestAnimationFrame(() => {
      // Uncontrolled input: clear the DOM value imperatively (Tab mid-test
      // reuses the same element and is not remounted).
      if (inputRef.current) inputRef.current.value = "";
      inputRef.current?.focus();
    });
  }, [mode, language]);

  useEffect(() => reset(), [reset]);

  const finish = useCallback(
    (finalTyped: string) => {
      if (!content) return;
      const finishedAt = Date.now();
      const next = computeResult(
        {
          content,
          typed: finalTyped,
          samples: samplesRef.current,
          startedAt: startedAtRef.current || finishedAt,
          finishedAt,
        },
        mode,
        contentIdFor(content),
      );
      setStatus("done");
      setResult(next);
      onResult(next);
    },
    [content, mode, onResult],
  );

  const sync = useCallback(
    (value: string, isComposing: boolean) => {
      if (status === "done") return;
      if (status === "idle" && value.length > 0) {
        startedAtRef.current = Date.now();
        setStatus("running");
      }

      setTyped(value);
      setComposing(isComposing);

      const committed = isComposing
        ? Math.max(0, value.length - 1)
        : value.length;
      const elapsed = Date.now() - (startedAtRef.current || Date.now());

      if (committed > committedRef.current) {
        for (let i = committedRef.current; i < committed; i += 1) {
          const char = value[i];
          samplesRef.current.push({
            atMs: elapsed,
            correct: i < target.length && char === target[i],
            strokes: strokesOfChar(char),
          });
        }
      } else if (committed < committedRef.current) {
        samplesRef.current.length = committed;
      }
      committedRef.current = committed;

      if (!isComposing && value.length >= target.length) {
        finish(value.slice(0, target.length));
      }
    },
    [status, target, finish],
  );

  useLayoutEffect(() => {
    const caret = caretRef.current;
    const container = containerRef.current;
    if (!caret || !container) return;

    const caretIndex = composing ? Math.max(0, typed.length - 1) : typed.length;
    const atEnd = caretIndex >= target.length;
    const anchor = charRefs.current[atEnd ? target.length - 1 : caretIndex];
    if (!anchor) return;

    const containerRect = container.getBoundingClientRect();
    const rect = anchor.getBoundingClientRect();
    const x = (atEnd ? rect.right : rect.left) - containerRect.left;
    caret.style.transform = `translate(${x}px, ${rect.top - containerRect.top}px)`;
    caret.style.height = `${rect.height}px`;
  }, [typed, composing, target]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!event.repeat) soundEngine.playForEvent(event.code, event.key);

      if (event.key === "Tab") {
        event.preventDefault();
        reset();
        return;
      }
      if (status === "done" && event.key === "Enter") {
        event.preventDefault();
        reset();
      }
    },
    [status, reset],
  );

  const focusInput = () => inputRef.current?.focus();
  const composingIndex = composing ? typed.length - 1 : -1;

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <LiveStats
        status={status}
        language={language}
        startedAt={startedAtRef.current}
        typed={typed}
        target={target}
        samples={samplesRef.current}
      />

      {result && content ? (
        <Results
          result={result}
          content={content}
          language={language}
          bestCpm={bestCpm}
          onRestart={reset}
        />
      ) : (
        <button
          type="button"
          aria-label={t.focusArea}
          onClick={focusInput}
          className="group relative w-full max-w-3xl cursor-text text-left"
        >
          <input
            ref={inputRef}
            // Uncontrolled on purpose: writing `value` back during IME
            // composition corrupts the Hangul buffer on Windows (chars come
            // out reversed/duplicated). We read from the element instead and
            // render the visible text from `typed` state.
            defaultValue=""
            maxLength={target.length}
            onChange={(event) =>
              sync(
                event.target.value,
                (event.nativeEvent as InputEvent).isComposing ?? false,
              )
            }
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={(event) => sync(event.currentTarget.value, false)}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="absolute -z-10 h-0 w-0 opacity-0"
            aria-hidden
          />

          <div
            ref={containerRef}
            className="no-select relative whitespace-pre-wrap break-keep font-sans text-[2rem] leading-[1.9] tracking-wide sm:text-[2.2rem]"
          >
            <div
              ref={caretRef}
              className={`pointer-events-none absolute left-0 top-0 w-[2px] bg-caret ${
                status === "running" ? "" : "caret-blink"
              }`}
              style={{ transition: "transform 90ms ease" }}
            />

            {Array.from(target).map((char, index) => {
              const isComposingChar = index === composingIndex;
              const isTyped = index < typed.length;

              let className = "text-faint";
              let glyph = char;

              if (isComposingChar) {
                className =
                  "text-fg underline decoration-muted/60 underline-offset-4";
                glyph = typed[index] ?? char;
              } else if (isTyped) {
                if (typed[index] === target[index]) {
                  className = "text-fg";
                } else {
                  className = "text-error";
                  glyph = typed[index];
                }
              }

              return (
                <span
                  key={`${index}-${char}`}
                  ref={(el) => {
                    charRefs.current[index] = el;
                  }}
                  className={className}
                >
                  {glyph}
                </span>
              );
            })}
          </div>

          {!focused && status !== "done" && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="glass rounded-full px-5 py-2.5 text-sm text-muted">
                {t.clickToStart}
              </span>
            </div>
          )}
        </button>
      )}

      {status !== "done" && (
        <p className="text-xs text-muted">
          <kbd className="font-mono">Tab</kbd> {t.newText}
        </p>
      )}
    </div>
  );
}
