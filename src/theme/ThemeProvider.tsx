import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Theme } from '../types';

interface ThemeContextValue {
  theme: Theme;
  resolved: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  /** Initial theme. Default 'auto'. */
  defaultTheme?: Theme;
  /** Override of resolved theme; useful for controlled mode. */
  theme?: Theme;
  /** Called when the user toggles the theme. */
  onThemeChange?: (theme: Theme) => void;
  children: ReactNode;
}

/**
 * Wraps children in a theme context and applies a data-theme attribute to the
 * scope so CSS variables can switch values. SSR-safe: `resolved` defaults to
 * 'light' on the server and reconciles after hydration.
 */
export function ThemeProvider({
  defaultTheme = 'auto',
  theme: controlled,
  onThemeChange,
  children,
}: ThemeProviderProps) {
  const [internal, setInternal] = useState<Theme>(controlled ?? defaultTheme);
  const theme = controlled ?? internal;
  const [resolved, setResolved] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (theme === 'auto') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const apply = () => setResolved(mql.matches ? 'dark' : 'light');
      apply();
      mql.addEventListener('change', apply);
      return () => mql.removeEventListener('change', apply);
    }
    setResolved(theme);
    return;
  }, [theme]);

  const setTheme = (next: Theme) => {
    if (controlled === undefined) setInternal(next);
    onThemeChange?.(next);
  };

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolved, setTheme }),
    [theme, resolved],
  );

  return (
    <ThemeContext.Provider value={value}>
      <div data-rup-root data-theme={resolved} className="contents">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;
  // Fallback: behave as if a ThemeProvider with default 'light' was present.
  return { theme: 'light', resolved: 'light', setTheme: () => undefined };
}
