import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingState {
  theme: 'light' | 'dark' | 'system';
  language: 'zh' | 'en';
  visibleProviders: string[];
  privacyMode: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (lang: 'zh' | 'en') => void;
  toggleProviderVisibility: (id: string) => void;
  setPrivacyMode: (enabled: boolean) => void;
}

export const useSettingStore = create<SettingState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      language: 'zh',
      visibleProviders: ['hash', 'crypto', 'crack', 'analyzer'],
      privacyMode: false,

      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
      setLanguage: (lang) => set({ language: lang }),
      toggleProviderVisibility: (id) => {
        const { visibleProviders } = get();
        const isVisible = visibleProviders.includes(id);
        set({
          visibleProviders: isVisible
            ? visibleProviders.filter(p => p !== id)
            : [...visibleProviders, id]
        });
      },
      setPrivacyMode: (enabled) => set({ privacyMode: enabled }),
    }),
    {
      name: 'cryptotool-settings',
    }
  )
);