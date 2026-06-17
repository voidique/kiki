"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ModeTabs } from "@/components/ModeTabs";
import { TypingTest } from "@/components/TypingTest";
import {
  loadPrefs,
  bestCpm as readBestCpm,
  savePrefs,
  saveResult,
} from "@/lib/storage";
import type { Language, TestMode, TestResult } from "@/lib/types";

export default function Home() {
  const [mode, setMode] = useState<TestMode>("words");
  const [language, setLanguage] = useState<Language>("ko");
  const [best, setBest] = useState(0);
  const hydrated = useRef(false);

  useEffect(() => {
    const prefs = loadPrefs();
    if (prefs.mode) setMode(prefs.mode);
    if (prefs.language) setLanguage(prefs.language);
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) savePrefs({ mode, language });
  }, [mode, language]);

  useEffect(() => {
    setBest(readBestCpm(mode, language));
  }, [mode, language]);

  const handleResult = useCallback((result: TestResult) => {
    const results = saveResult(result);
    setBest(readBestCpm(result.mode, result.language, results));
  }, []);

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between gap-3 px-6 py-5 sm:px-10">
        <div className="flex items-center gap-3">
          <h1 className="select-none font-display text-2xl font-bold lowercase tracking-tight">
            kiki
          </h1>
          <LanguageToggle language={language} onChange={setLanguage} />
        </div>
        <ModeTabs mode={mode} onChange={setMode} />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pt-28 pb-24">
        <TypingTest
          mode={mode}
          language={language}
          bestCpm={best}
          onResult={handleResult}
        />
      </main>
    </div>
  );
}
