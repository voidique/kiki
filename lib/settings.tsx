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

type Theme = "light" | "dark";

interface Settings {
  theme: Theme;
  toggleTheme: () => void;
  soundOn: boolean;
  toggleSound: () => void;
  volume: number;
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

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

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
