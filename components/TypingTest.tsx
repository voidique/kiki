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
import { type CharSample, computeResult } from "@/lib/stats";
import type { ContentItem, TestMode, TestResult } from "@/lib/types";
import { LiveStats } from "./LiveStats";
import { Results } from "./Results";

type Status = "idle" | "running" | "done";

interface Props {
  mode: TestMode;
  onResult: (result: TestResult) => void;
  bestCpm: number;
}

export function TypingTest({ mode, onResult, bestCpm }: Props) {
  // 서버에서는 null — makeContent 의 Math.random 으로 인한 하이드레이션 불일치를 막기 위해
  // 첫 지문은 마운트 후(useEffect)에 클라이언트에서만 생성한다.
  const [content, setContent] = useState<ContentItem | null>(null);
  const [typed, setTyped] = useState("");
  const [composing, setComposing] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<TestResult | null>(null);
  const [focused, setFocused] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  const charEls = useRef<(HTMLSpanElement | null)[]>([]);

  const startedAtRef = useRef<number>(0);
  const samplesRef = useRef<CharSample[]>([]);
  const sampledLenRef = useRef(0);

  const target = content?.text ?? "";

  /** 새 지문으로 초기화 */
  const reset = useCallback((nextMode: TestMode) => {
    setContent(makeContent(nextMode));
    setTyped("");
    setComposing(false);
    setStatus("idle");
    setResult(null);
    samplesRef.current = [];
    sampledLenRef.current = 0;
    startedAtRef.current = 0;
    // 다음 프레임에 포커스 (DOM 갱신 후)
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  // 모드가 바뀌면 새 지문
  useEffect(() => {
    reset(mode);
  }, [mode, reset]);

  const finish = useCallback(
    (finalTyped: string) => {
      if (!content) return;
      const finishedAt = Date.now();
      const res = computeResult(
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
      setResult(res);
      onResult(res);
    },
    [content, mode, onResult],
  );

  /** 입력값 동기화 + 표본/완료 처리 (onChange · compositionEnd 공통 진입점) */
  const sync = useCallback(
    (value: string, isComposing: boolean) => {
      if (status === "done") return;
      if (status === "idle" && value.length > 0) {
        startedAtRef.current = Date.now();
        setStatus("running");
      }

      setTyped(value);
      setComposing(isComposing);

      // 조합 중인 마지막 글자는 아직 확정 전 → 표본에서 제외
      const committed = isComposing
        ? Math.max(0, value.length - 1)
        : value.length;
      const now = Date.now() - (startedAtRef.current || Date.now());

      if (committed > sampledLenRef.current) {
        for (let i = sampledLenRef.current; i < committed; i++) {
          const ch = value[i];
          samplesRef.current.push({
            atMs: now,
            correct: i < target.length && ch === target[i],
            strokes: strokesOfChar(ch),
          });
        }
        sampledLenRef.current = committed;
      } else if (committed < sampledLenRef.current) {
        // 백스페이스 등으로 줄어들면 표본도 잘라낸다
        samplesRef.current.length = committed;
        sampledLenRef.current = committed;
      }

      if (!isComposing && value.length >= target.length) {
        finish(value.slice(0, target.length));
      }
    },
    [status, target, finish],
  );

  // ── 캐럿 위치 측정 (비례 폰트·줄바꿈 대응) ───────────────────────
  useLayoutEffect(() => {
    const caret = caretRef.current;
    const container = containerRef.current;
    if (!caret || !container) return;

    const caretIndex = composing ? Math.max(0, typed.length - 1) : typed.length;
    const cRect = container.getBoundingClientRect();

    if (caretIndex < target.length) {
      const el = charEls.current[caretIndex];
      if (!el) return;
      const r = el.getBoundingClientRect();
      caret.style.transform = `translate(${r.left - cRect.left}px, ${r.top - cRect.top}px)`;
      caret.style.height = `${r.height}px`;
    } else {
      // 마지막 글자 오른쪽
      const el = charEls.current[target.length - 1];
      if (!el) return;
      const r = el.getBoundingClientRect();
      caret.style.transform = `translate(${r.right - cRect.left}px, ${r.top - cRect.top}px)`;
      caret.style.height = `${r.height}px`;
    }
  }, [typed, composing, target]);

  // ── 키 입력: Tab(=새 지문), 완료 후 Enter(=재시작) ─────────────────
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        reset(mode);
        return;
      }
      if (status === "done" && e.key === "Enter") {
        e.preventDefault();
        reset(mode);
      }
    },
    [mode, status, reset],
  );

  const focusInput = () => inputRef.current?.focus();

  const composingIndex = composing ? typed.length - 1 : -1;

  return (
    <div className="flex w-full flex-col items-center gap-8">
      {status !== "done" && (
        <LiveStats
          status={status}
          startedAt={startedAtRef.current}
          typed={typed}
          target={target}
          samples={samplesRef.current}
        />
      )}

      {result && content ? (
        <Results
          result={result}
          content={content}
          bestCpm={bestCpm}
          onRestart={() => reset(mode)}
        />
      ) : (
        <button
          type="button"
          aria-label="타이핑 영역에 집중"
          onClick={focusInput}
          className="group relative w-full max-w-3xl cursor-text text-left"
        >
          {/* 화면 밖 숨김 입력 — IME 가 여기에 붙는다 */}
          <input
            ref={inputRef}
            value={typed}
            maxLength={target.length}
            onChange={(e) =>
              sync(
                e.target.value,
                (e.nativeEvent as InputEvent).isComposing ?? false,
              )
            }
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={(e) => sync(e.currentTarget.value, false)}
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
            {/* 캐럿 */}
            <div
              ref={caretRef}
              className={`pointer-events-none absolute left-0 top-0 w-[2px] bg-caret ${
                status === "running" ? "" : "caret-blink"
              }`}
              style={{ transition: "transform 90ms ease" }}
            />

            {Array.from(target).map((ch, i) => {
              const isComposingChar = i === composingIndex;
              const isTyped = i < typed.length;
              let cls = "text-faint"; // 미입력
              let glyph = ch;

              if (isComposingChar) {
                cls =
                  "text-fg underline decoration-muted/60 underline-offset-4";
                glyph = typed[i] ?? ch;
              } else if (isTyped) {
                if (typed[i] === target[i]) {
                  cls = "text-fg";
                } else {
                  cls = "text-error";
                  glyph = typed[i]; // 실제 친 (틀린) 글자를 보여줌
                }
              }

              return (
                <span
                  // 지문 인덱스 기반 key (글자 중복 있어도 안전)
                  key={`${i}-${ch}`}
                  ref={(el) => {
                    charEls.current[i] = el;
                  }}
                  className={cls}
                >
                  {glyph}
                </span>
              );
            })}
          </div>

          {!focused && status !== "done" && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="rounded-md bg-bg/70 px-4 py-2 text-sm text-muted backdrop-blur-sm">
                클릭하면 시작
              </span>
            </div>
          )}
        </button>
      )}

      {status !== "done" && (
        <p className="text-xs text-muted">
          <kbd className="font-mono">Tab</kbd> 새 지문
        </p>
      )}
    </div>
  );
}
