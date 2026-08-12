import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AppShell } from './components/layout/AppShell';
import { AppRouter } from './router';
import { useProviderStore } from './stores/providerStore';
import { useHistoryStore } from './stores/historyStore';
import { useCrackStore } from './stores/crackStore';
import { useSettingStore } from './stores/settingStore';

function AppContent() {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const fetchProviders = useProviderStore((s) => s.fetchProviders);
  const initHistory = useHistoryStore((s) => s.init);
  const initCrack = useCrackStore((s) => s.init);
  const initTheme = useSettingStore((s) => s.setTheme);

  useEffect(() => {
    fetchProviders();
    initHistory();
    initCrack();

    try {
      const saved = localStorage.getItem('cryptotool-settings');
      const parsed = saved ? JSON.parse(saved) : null;
      initTheme(parsed?.state?.theme ?? 'system');
    } catch {
      initTheme('system');
    }
  }, [initTheme]);

  const getTitle = useCallback(
    (path: string): string => {
      const map: Record<string, string> = {
        '/': t('nav.dashboard'),
        '/hash': t('nav.hash'),
        '/encode': t('nav.encode'),
        '/crack': t('nav.crack'),
        '/settings': t('nav.settings'),
      };
      if (map[path]) return map[path];
      if (path.startsWith('/provider/')) {
        const id = path.split('/provider/')[1];
        return t(`provider.${id}.name`, id);
      }
      return 'CryptoTool';
    },
    [t],
  );

  const [title, setTitle] = useState(getTitle(location.pathname));
  useEffect(() => {
    setTitle(getTitle(location.pathname));
  }, [location.pathname, i18n.language, getTitle]);

  return (
    <AppShell title={title} showBack={location.pathname !== '/'}>
      <AppRouter />
    </AppShell>
  );
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}