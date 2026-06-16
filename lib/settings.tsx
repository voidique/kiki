"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { soundEngine } from "./sound";

/*
 * 전역 사용자 설정 — 테마(라이트/다크)와 키보드 사운드(on/off·볼륨).
 * localStorage 에 보관하고, 테마는 <html data-theme> 로 반영한다.
 * 첫 페인트 깜빡임은 layout 의 인라인 스크립트가 미리 막는다.
 */

type Theme = "light" | "dark";

interface Settings {
  theme: Theme;
  toggleTheme: () => void;
  soundOn: boolean;
  toggleSound: () => void;
  volume: number; // 0..1
  setVolume: (v: number) => void;
}

const THEME_KEY = "kiki.theme";
const SOUND_KEY = "kiki.sound.on";
const VOLUME_KEY = "kiki.sound.volume";

const SettingsContext = createContext<Settings | null>(null);

function systemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // SSR/첫 렌더는 결정적 기본값 → 마운트 후 실제 값으로 동기화 (하이드레이션 안전)
  const [theme, setTheme] = useState<Theme>("light");
  const [soundOn, setSoundOn] = useState(true);
  const [volume, setVolumeState] = useState(0.6);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_KEY) as Theme | null;
    setTheme(storedTheme ?? systemTheme());

    const storedSound = window.localStorage.getItem(SOUND_KEY);
    if (storedSound !== null) setSoundOn(storedSound === "1");

    const storedVol = window.localStorage.getItem(VOLUME_KEY);
    if (storedVol !== null) {
      const v = Number.parseFloat(storedVol);
      if (!Number.isNaN(v)) setVolumeState(v);
    }
  }, []);

  // 테마 → <html data-theme> + 저장
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // 사운드 엔진 동기화 + 저장
  useEffect(() => {
    soundEngine.setEnabled(soundOn);
    window.localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0");
    if (soundOn) soundEngine.prime();
  }, [soundOn]);

  useEffect(() => {
    soundEngine.setVolume(volume);
    window.localStorage.setItem(VOLUME_KEY, String(volume));
  }, [volume]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  );
  const toggleSound = useCallback(() => setSoundOn((s) => !s), []);
  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.min(1, Math.max(0, v)));
  }, []);

  const value = useMemo<Settings>(
    () => ({
      theme,
      toggleTheme,
      soundOn,
      toggleSound,
      volume,
      setVolume,
    }),
    [theme, toggleTheme, soundOn, toggleSound, volume, setVolume],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): Settings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
