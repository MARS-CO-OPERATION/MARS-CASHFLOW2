import { STORAGE_KEYS } from './store';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  '--mars-green': string;
  '--mars-green-hover': string;
  '--mars-dark': string;
  '--mars-ink': string;
  '--mars-muted': string;
  '--mars-bg': string;
  '--mars-card': string;
  '--mars-card-border': string;
  '--mars-border-subtle': string;
  '--mars-surface-light': string;
  '--mars-surface-hover': string;
  '--mars-nav-bg': string;
  '--mars-accent': string;
  '--mars-red': string;
  '--mars-yellow': string;
  '--mars-input-bg': string;
  '--mars-input-border': string;
  '--mars-dropdown-bg': string;
  '--mars-highlight': string;
  '--mars-shadow': string;
}

export const THEME_CSS_VARS: Record<ThemeMode, ThemeColors> = {
  light: {
    '--mars-green': '#0AB77F',
    '--mars-green-hover': '#07885E',
    '--mars-dark': '#101915',
    '--mars-ink': '#17231E',
    '--mars-muted': '#65766F',
    '--mars-bg': '#F5F8F6',
    '--mars-card': '#FFFFFF',
    '--mars-card-border': '#E2E8F0',
    '--mars-border-subtle': '#DFE8E3',
    '--mars-surface-light': '#E2F8EF',
    '--mars-surface-hover': '#D3F3E6',
    '--mars-nav-bg': 'rgba(245, 248, 246, 0.95)',
    '--mars-accent': '#62E3B6',
    '--mars-red': '#D93838',
    '--mars-yellow': '#F59E0B',
    '--mars-input-bg': '#FFFFFF',
    '--mars-input-border': '#DFE8E3',
    '--mars-dropdown-bg': '#FFFFFF',
    '--mars-highlight': '#F9FBFA',
    '--mars-shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
  },
  dark: {
    '--mars-green': '#10E3A0',
    '--mars-green-hover': '#0CB881',
    '--mars-dark': '#070B09',
    '--mars-ink': '#F2F7F4',
    '--mars-muted': '#A3B8AD',
    '--mars-bg': '#0B120E',
    '--mars-card': '#131F19',
    '--mars-card-border': '#1E3328',
    '--mars-border-subtle': '#233D30',
    '--mars-surface-light': '#162B21',
    '--mars-surface-hover': '#1E3B2E',
    '--mars-nav-bg': 'rgba(11, 18, 14, 0.95)',
    '--mars-accent': '#62E3B6',
    '--mars-red': '#F87171',
    '--mars-yellow': '#FBBF24',
    '--mars-input-bg': '#101A15',
    '--mars-input-border': '#233D30',
    '--mars-dropdown-bg': '#131F19',
    '--mars-highlight': '#17261F',
    '--mars-shadow': '0 4px 14px 0 rgba(0, 0, 0, 0.45)',
  },
};

/**
 * Apply theme CSS variables and documentElement classes immediately
 */
export function applyTheme(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const isDark = theme === 'dark';

  if (isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }

  // Update CSS custom properties on document.documentElement
  const colors = THEME_CSS_VARS[theme];
  for (const [property, value] of Object.entries(colors)) {
    root.style.setProperty(property, value);
  }
}

/**
 * Retrieve user's persisted theme preference with fallback to system preference
 */
export function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';

  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch (err) {
    console.warn('Could not read theme preference from localStorage:', err);
  }

  return 'light';
}

/**
 * Persist theme preference to localStorage and apply CSS variables
 */
export function saveThemePreference(theme: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (err) {
    console.warn('Could not save theme preference to localStorage:', err);
  }
  applyTheme(theme);
}
