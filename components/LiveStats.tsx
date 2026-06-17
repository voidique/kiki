"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { CharSample } from "@/lib/stats";

type Status = "idle" | "running" | "done";

interface LiveStatsProps {
  status: Status;
  startedAt: number;
  typed: string;
  target: string;
  samples: CharSample[];
}

const SHELL_SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 26,
  mass: 1.1,
} as const;

const CONTENT_SPRING = { type: "spring", stiffness: 700, damping: 38 } as const;

const SHOWN = { opacity: 1, filter: "blur(0px)", y: 0 };
const ABOVE = { opacity: 0, filter: "blur(8px)", y: -8 };
const BELOW = { opacity: 0, filter: "blur(8px)", y: 8 };

export function LiveStats({
  status,
  startedAt,
  typed,
  target,
  samples,
}: LiveStatsProps) {
  const [, rerender] = useState(0);

  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => rerender((n) => n + 1), 200);
    return () => clearInterval(id);
  }, [status]);

  const running = status === "running";
  const visible = status !== "done";

  const elapsedMs = running && startedAt ? Date.now() - startedAt : 0;
  const minutes = elapsedMs / 60_000;
  const correctStrokes = samples.reduce(
    (sum, sample) => (sample.correct ? sum + sample.strokes : sum),
    0,
  );
  const cpm = minutes > 0 ? Math.round(correctStrokes / minutes) : 0;

  const matched = countMatches(typed, target);
  const accuracy =
    typed.length > 0 ? Math.round((matched / typed.length) * 100) : 100;
  const seconds = Math.floor(elapsedMs / 1000);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[4.75rem] z-40 flex justify-center px-3">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8, y: -18 }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: visible ? 1 : 0.82,
          y: visible ? 0 : -18,
        }}
        transition={SHELL_SPRING}
        className="island flex max-w-[calc(100vw-1.5rem)] items-center gap-3 overflow-hidden whitespace-nowrap rounded-full px-4 py-2 text-white"
      >
        <motion.span
          layout
          className={`h-2 w-2 shrink-0 rounded-full bg-white dot-pulse ${
            running ? "" : "opacity-50"
          }`}
        />

        <AnimatePresence mode="popLayout" initial={false}>
          {running ? (
            <motion.div
              key="running"
              layout="position"
              initial={BELOW}
              animate={SHOWN}
              exit={ABOVE}
              transition={CONTENT_SPRING}
              className="flex items-center gap-2.5 font-mono tabular-nums sm:gap-3"
            >
              <Stat label="타수" value={cpm} />
              <Rule />
              <Stat label="정확도" value={`${accuracy}%`} />
              <Rule />
              <Stat label="시간" value={`${seconds}s`} />
              <Rule />
              <span className="text-xs text-white/40">
                {typed.length}/{target.length}
              </span>
            </motion.div>
          ) : (
            <motion.span
              key="idle"
              layout="position"
              initial={ABOVE}
              animate={SHOWN}
              exit={BELOW}
              transition={CONTENT_SPRING}
              className="pr-1 text-sm text-white/75"
            >
              타이핑을 시작하세요
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function countMatches(typed: string, target: string) {
  let matched = 0;
  for (let i = 0; i < typed.length; i++) {
    if (i < target.length && typed[i] === target[i]) matched += 1;
  }
  return matched;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="hidden text-[0.6rem] tracking-wider text-white/40 sm:inline">
        {label}
      </span>
      <span className="text-sm font-medium text-white">{value}</span>
    </span>
  );
}

function Rule() {
  return <span className="h-3 w-px bg-white/15" />;
}
