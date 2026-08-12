import { useLocation, useNavigate } from 'react-router-dom';
import {
  Shield, LayoutGrid, Settings, Fingerprint, Key, Search, Zap, Wrench, Code
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProviderStore } from '../../stores/providerStore';

const categoryIcons: Record<string, React.ElementType> = {
  Hash: Fingerprint, Crypto: Key, Analyzer: Search, Crack: Zap, File: Code, default: Wrench
};

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const providers = useProviderStore((s) => s.providers);

  return (
    <aside
      className="w-[220px] flex flex-col h-full shrink-0"
      style={{
        backgroundColor: 'var(--color-sidebar)',
        borderRight: `1px solid var(--color-border)`,
      }}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 shrink-0" style={{ borderBottom: `1px solid var(--color-border)` }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center mr-2.5 shrink-0"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="font-semibold text-[15px] leading-tight truncate" style={{ color: 'var(--color-text-primary)' }}>
            CryptoTool
          </h1>
          <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>v1.0.0</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2.5 space-y-0.5">
        <SidebarItem
          active={location.pathname === '/'}
          onClick={() => navigate('/')}
          icon={LayoutGrid}
          label={t('nav.dashboard')}
        />
        {providers.map((p) => {
          const Icon = categoryIcons[p.category] || categoryIcons.default;
          const path = `/provider/${p.id}`;
          const label = t(`provider.${p.id}.name`, p.name);
          return (
            <SidebarItem
              key={p.id}
              active={location.pathname === path}
              onClick={() => navigate(path)}
              icon={Icon}
              label={label}
            />
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-2.5 shrink-0" style={{ borderTop: `1px solid var(--color-border)` }}>
        <SidebarItem
          active={location.pathname === '/settings'}
          onClick={() => navigate('/settings')}
          icon={Settings}
          label={t('nav.settings')}
        />
      </div>
    </aside>
  );
}

function SidebarItem({ active, onClick, icon: Icon, label }: {
  active: boolean; onClick: () => void; icon: React.ElementType; label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all"
      style={{
        backgroundColor: active ? 'rgba(59,130,246,0.1)' : 'transparent',
        color: active ? 'var(--color-primary)' : 'var(--color-text-primary)',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.05)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <Icon className="w-[18px] h-[18px] shrink-0" style={{ opacity: active ? 1 : 0.65 }} />
      <span className="truncate">{label}</span>
    </button>
  );
}