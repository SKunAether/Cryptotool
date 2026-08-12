import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  isAuto: boolean;
  setTheme: (theme: Theme) => void;
  setAutoTheme: () => void;
  toggleTheme: () => void;
}

const getSystemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const hasManualPreference = () => localStorage.getItem('theme') !== null;

const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute('data-theme', theme);
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: hasManualPreference()
    ? (localStorage.getItem('theme') as Theme)
    : getSystemTheme(),
  isAuto: !hasManualPreference(),

  setTheme: (theme: Theme) => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    set({ theme, isAuto: false });
  },

  setAutoTheme: () => {
    localStorage.removeItem('theme');
    const systemTheme = getSystemTheme();
    applyTheme(systemTheme);
    set({ theme: systemTheme, isAuto: true });
  },

  toggleTheme: () => {
    const { theme, isAuto } = get();
    if (isAuto) {
      const next = theme === 'light' ? 'dark' : 'light';
      get().setTheme(next);
    } else {
      const next = theme === 'light' ? 'dark' : 'light';
      get().setTheme(next);
    }
  },
}));

// 初始化
applyTheme(useThemeStore.getState().theme);