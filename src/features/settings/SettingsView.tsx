import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSettingStore } from '../../stores/settingStore';
import { useProviderStore } from '../../stores/providerStore';
import { usePrivacyStore } from '../../stores/privacyStore';
import { changeLanguage } from '../../i18n';
import { invokeCmd } from '../../api';
import {
  Sun, Moon, Monitor, Check, Shield,
  Globe, ExternalLink, RefreshCw, ArrowLeft,
  Power, Eye, MonitorDown
} from 'lucide-react';
import { Github } from '../../components/icons';
import { Card } from '../../components/common/Card';

type TabKey = 'general' | 'window' | 'about';

export function SettingsView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const { theme, language, visibleProviders, setTheme, setLanguage, toggleProviderVisibility } = useSettingStore();
  const { providers } = useProviderStore();
  const { privacyMode, togglePrivacy } = usePrivacyStore();
  const [appVersion, setAppVersion] = useState('1.0.0');

  // 窗口行为状态
  const [autoStart, setAutoStart] = useState(false);
  const [silentStart, setSilentStart] = useState(() => localStorage.getItem('ct-silent-start') === 'true');
  const [closeToTray, setCloseToTray] = useState(() => localStorage.getItem('ct-close-tray') !== 'false');

  useEffect(() => {
    invokeCmd<string>('get_app_version').then(v => setAppVersion(v)).catch(() => {});
    invokeCmd<boolean>('get_autostart_status').then(setAutoStart).catch(() => {});
  }, []);

  const handleToggleAutostart = async (enabled: boolean) => {
    try { await invokeCmd('toggle_autostart', { enabled }); setAutoStart(enabled); } catch {}
  };

  const handleSilentChange = (v: boolean) => { setSilentStart(v); localStorage.setItem('ct-silent-start', String(v)); };
  const handleTrayChange = (v: boolean) => { setCloseToTray(v); localStorage.setItem('ct-close-tray', String(v)); };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'general', label: t('settings.tabs.general') },
    { key: 'window', label: t('settings.tabs.window') },
    { key: 'about', label: t('settings.tabs.about') },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* 返回标题 */}
      <div className="flex items-center gap-3 mb-1">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{t('settings.title')}</h1>
      </div>

      {/* Pill 标签 */}
      <div
        className="flex p-1 rounded-xl"
        style={{ backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 py-1.5 px-4 text-sm font-medium rounded-lg transition-all"
            style={{
              backgroundColor: activeTab === tab.key ? '#fff' : 'transparent',
              color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容 */}
      <div className="space-y-4">
        {activeTab === 'general' && (
          <>
            <Card title={t('settings.language.title')} hover={false}>
              <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                {t('settings.language.desc')}
              </p>
              <div className="flex gap-2">
                <PillBtn active={language === 'zh'} onClick={() => { setLanguage('zh'); changeLanguage('zh'); }}>简体中文</PillBtn>
                <PillBtn active={language === 'en'} onClick={() => { setLanguage('en'); changeLanguage('en'); }}>English</PillBtn>
              </div>
            </Card>

            <Card title={t('settings.theme.title')} hover={false}>
              <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                {t('settings.theme.desc')}
              </p>
              <div className="flex gap-2">
                <ThemeBtn active={theme === 'light'} onClick={() => setTheme('light')} icon={Sun} label={t('settings.theme.light')} />
                <ThemeBtn active={theme === 'dark'} onClick={() => setTheme('dark')} icon={Moon} label={t('settings.theme.dark')} />
                <ThemeBtn active={theme === 'system'} onClick={() => setTheme('system')} icon={Monitor} label={t('settings.theme.system')} />
              </div>
            </Card>

            <Card title={t('settings.homepage.title')} description={t('settings.homepage.desc')} hover={false}>
              <div className="flex flex-wrap gap-2 mt-3">
                {providers.map((p) => {
                  const isVisible = visibleProviders.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleProviderVisibility(p.id)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all"
                      style={{
                        backgroundColor: isVisible ? 'var(--color-primary)' : 'transparent',
                        color: isVisible ? '#fff' : 'var(--color-text-primary)',
                        borderColor: isVisible ? 'var(--color-primary)' : 'var(--color-border)',
                      }}
                    >
                      {t(`provider.${p.id}.name`, p.name)}
                      {isVisible && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </Card>

            <div
              className="rounded-2xl p-5 border flex items-center justify-between"
              style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t('settings.privacy.title')}</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{t('settings.privacy.desc')}</p>
              </div>
              <label className="ios-switch">
                <input type="checkbox" checked={privacyMode} onChange={togglePrivacy} />
                <span className="slider" />
              </label>
            </div>
          </>
        )}

        {activeTab === 'window' && (
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <WindowItem
              icon={Power}
              title={t('settings.window.autostart')}
              desc={t('settings.window.autostart_desc')}
              checked={autoStart}
              onChange={handleToggleAutostart}
            />
            <WindowItem
              icon={Eye}
              title={t('settings.window.silent')}
              desc={t('settings.window.silent_desc')}
              checked={silentStart}
              onChange={handleSilentChange}
            />
            <WindowItem
              icon={MonitorDown}
              title={t('settings.window.tray')}
              desc={t('settings.window.tray_desc')}
              checked={closeToTray}
              onChange={handleTrayChange}
            />
          </div>
        )}

        {activeTab === 'about' && (
          <Card hover={false}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>CryptoTool</h3>
                  <span
                    className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs border"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                  >
                    {t('settings.about.version')} {appVersion}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <IconBtn icon={Globe} label={t('settings.about.official_site')} onClick={() => window.open('https://crypto-tool.app', '_blank')} />
                <IconBtn icon={Github} label={t('settings.about.github')} onClick={() => window.open('https://github.com/crypto-tool', '_blank')} />
                <IconBtn icon={ExternalLink} label={t('settings.about.changelog')} onClick={() => window.open('https://github.com/crypto-tool/releases', '_blank')} />
                <button
                  onClick={() => alert('Coming soon')}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm text-white transition-colors"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <RefreshCw className="w-3.5 h-3.5" /> {t('settings.about.check_update')}
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function PillBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg border text-sm font-medium transition-all"
      style={{
        backgroundColor: active ? 'var(--color-primary)' : 'transparent',
        color: active ? '#fff' : 'var(--color-text-primary)',
        borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
      }}
    >
      {children}
    </button>
  );
}

function ThemeBtn({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all"
      style={{
        backgroundColor: active ? 'var(--color-primary)' : 'transparent',
        color: active ? '#fff' : 'var(--color-text-primary)',
        borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
      }}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}

function IconBtn({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-sm transition-colors"
      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
}

function WindowItem({ icon: Icon, title, desc, checked, onChange }: any) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4 border-b last:border-b-0"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'rgba(59,130,246,0.08)' }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color: 'var(--color-primary)' }} />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{title}</h4>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
        </div>
      </div>
      <label className="ios-switch">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="slider" />
      </label>
    </div>
  );
}