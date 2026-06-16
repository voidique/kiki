"use client";

import { useCallback, useEffect, useState } from "react";
import { ModeTabs } from "@/components/ModeTabs";
import { TypingTest } from "@/components/TypingTest";
import { bestCpm as readBestCpm, saveResult } from "@/lib/storage";
import type { TestMode, TestResult } from "@/lib/types";

export default function Home() {
  const [mode, setMode] = useState<TestMode>("words");
  const [best, setBest] = useState(0);

  // 모드별 개인 최고 타수 로드 (마운트 후, localStorage 접근)
  useEffect(() => {
    setBest(readBestCpm(mode));
  }, [mode]);

  const handleResult = useCallback((result: TestResult) => {
    const rows = saveResult(result);
    setBest(readBestCpm(result.mode, rows));
  }, []);

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <h1 className="select-none font-display text-2xl font-bold lowercase tracking-tight">
          kiki
        </h1>
        <ModeTabs mode={mode} onChange={setMode} />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
        <TypingTest mode={mode} onResult={handleResult} bestCpm={best} />
      </main>
    </div>
  );
}
