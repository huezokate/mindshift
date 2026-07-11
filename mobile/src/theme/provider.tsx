import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { themes } from './build';
import { getSavedMode, saveMode } from './storage';
import type { Theme, ThemeMode } from './types';

/** Mode metadata, ordered light → cheerful → dark with the Storybook labels
    (V200/.storybook/preview.tsx) so switchers on both platforms read the same. */
export const MODES: { value: ThemeMode; label: string }[] = [
  { value: 'notepad', label: 'Light · Notepad' },
  { value: 'kawaii', label: 'Cheerful · Kawaii' },
  { value: 'cyberpunk', label: 'Dark · Cyberpunk' },
];

const DEFAULT: ThemeMode = 'cyberpunk';

type ThemeContext = { mode: ThemeMode; setMode: (mode: ThemeMode) => void; tokens: Theme };

const Ctx = createContext<ThemeContext | null>(null);

export function ThemeProvider({
  children,
  fixedMode,
}: {
  children: ReactNode;
  /** Pin the theme (no persistence, setMode is a no-op) — for side-by-side
      mode comparisons like the Storybook TriModes helper. */
  fixedMode?: ThemeMode;
}) {
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT);

  useEffect(() => {
    if (fixedMode) return;
    let cancelled = false;
    getSavedMode().then((saved) => {
      if (saved && !cancelled) setModeState(saved);
    });
    return () => {
      cancelled = true;
    };
  }, [fixedMode]);

  const setMode = (next: ThemeMode) => {
    if (fixedMode) return;
    setModeState(next);
    void saveMode(next);
  };

  const shown = fixedMode ?? mode;
  return (
    <Ctx.Provider value={{ mode: shown, setMode, tokens: themes[shown] }}>{children}</Ctx.Provider>
  );
}

export function useTheme(): ThemeContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
