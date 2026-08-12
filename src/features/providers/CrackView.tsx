import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { open } from '@tauri-apps/plugin-dialog';
import { KeyRound, Zap, Pause, Play, Square, Trash2 } from 'lucide-react';
import { useCrackStore } from '../../stores/crackStore';
import { Card } from '../../components/common/Card';

export function CrackView() {
  const { t } = useTranslation();
  const store = useCrackStore();
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [store.logs]);

  const handleSelectDict = async () => {
    try {
      const selected = await open({
        title: t('crack.select_dict_title'),
        multiple: false,
        filters: [{ name: t('crack.dict_files_filter'), extensions: ['txt', 'dic', 'lst', 'dict'] }],
      });
      if (typeof selected === 'string') {
        store.setConfig({ dictPath: selected });
      }
    } catch (err) {
      console.error('选择文件失败:', err);
    }
  };

  const maskHelp = [
    { syntax: '?d', desc: t('crack.mask_d') },
    { syntax: '?l', desc: t('crack.mask_l') },
    { syntax: '?u', desc: t('crack.mask_u') },
    { syntax: '?a', desc: t('crack.mask_a') },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* 配置面板 */}
      <Card
        title={t('crack.title')}
        icon={<KeyRound className="w-4 h-4 text-red-500" />}
        action={
          <div className="flex rounded-lg p-0.5" style={{ backgroundColor: 'var(--color-background)' }}>
            <button
              onClick={() => store.setConfig({ attackMode: 'mask' })}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all"
              style={{
                backgroundColor: store.attackMode === 'mask' ? 'var(--color-primary)' : 'transparent',
                color: store.attackMode === 'mask' ? '#fff' : 'var(--color-text-secondary)',
              }}
            >
              {t('crack.mask_mode')}
            </button>
            <button
              onClick={() => store.setConfig({ attackMode: 'dictionary' })}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all"
              style={{
                backgroundColor: store.attackMode === 'dictionary' ? 'var(--color-primary)' : 'transparent',
                color: store.attackMode === 'dictionary' ? '#fff' : 'var(--color-text-secondary)',
              }}
            >
              {t('crack.dict_mode')}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              {t('crack.target_hash')}
            </label>
            <input
              type="text"
              value={store.targetHash}
              onChange={(e) => store.setConfig({ targetHash: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono outline-none transition-colors focus:border-blue-400"
              style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              placeholder="5d41402abc4b2a76b9719d911017c592"
            />
          </div>

          {store.attackMode === 'mask' ? (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                {t('crack.mask')}
              </label>
              <input
                type="text"
                value={store.mask}
                onChange={(e) => store.setConfig({ mask: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono outline-none transition-colors focus:border-blue-400"
                style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                placeholder="?d?d?d"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {maskHelp.map((item) => (
                  <span
                    key={item.syntax}
                    className="px-2 py-0.5 rounded-md text-[11px] border font-mono"
                    style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                  >
                    {item.syntax} {item.desc}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                {t('crack.dict_path')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={store.dictPath}
                  onChange={(e) => store.setConfig({ dictPath: e.target.value })}
                  className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border text-sm font-mono outline-none transition-colors focus:border-blue-400"
                  style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  placeholder={t('crack.dict_path_placeholder')}
                />
                <button
                  onClick={handleSelectDict}
                  className="shrink-0 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors active:scale-[0.98]"
                  style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                >
                  {t('crack.browse')}
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col justify-end">
            <div className="space-y-2 text-sm mb-3">
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{t('crack.algorithm')}</span>
                <select
                  value={store.algorithm}
                  onChange={(e) => store.setConfig({ algorithm: e.target.value })}
                  className="px-2 py-1 rounded-lg border text-xs outline-none"
                  style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                >
                  <option value="md5">MD5</option>
                  <option value="sha256">SHA-256</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{t('crack.speed')}</span>
                <span className="font-mono text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {store.speed > 0 ? `${Math.round(store.speed).toLocaleString()} H/s` : '-'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {!store.running ? (
                <button
                  onClick={store.start}
                  disabled={!store.targetHash.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: 'var(--color-primary)', opacity: !store.targetHash.trim() ? 0.5 : 1 }}
                >
                  <Zap className="w-4 h-4" /> {t('crack.start')}
                </button>
              ) : (
                <>
                  <button
                    onClick={store.stop}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: 'var(--color-danger)' }}
                  >
                    <Square className="w-3.5 h-3.5" /> {t('crack.stop')}
                  </button>
                  {!store.paused ? (
                    <button
                      onClick={store.pause}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                      style={{ backgroundColor: 'var(--color-warning)' }}
                    >
                      <Pause className="w-3.5 h-3.5" /> {t('crack.pause')}
                    </button>
                  ) : (
                    <button
                      onClick={store.resume}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                      style={{ backgroundColor: 'var(--color-success)' }}
                    >
                      <Play className="w-3.5 h-3.5" /> {t('crack.resume')}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* 进度面板 */}
      {store.running && (
        <Card title={t('crack.progress')} icon={<Zap className="w-4 h-4 text-blue-500" />} hover={false}>
          <div className="flex items-center justify-between mb-3">
            <span
              className="px-2 py-0.5 rounded-md text-xs font-medium"
              style={{
                backgroundColor: store.paused ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
                color: store.paused ? 'var(--color-warning)' : 'var(--color-primary)',
              }}
            >
              {store.paused ? t('crack.paused') : t('crack.running')}
            </span>
            {store.attackMode === 'mask' && (
              <span className="text-sm font-mono font-semibold" style={{ color: 'var(--color-primary)' }}>
                {store.progress.toFixed(1)}%
              </span>
            )}
          </div>
          {store.attackMode === 'mask' && (
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
              <div
                className="h-full rounded-full transition-all duration-300 ease-linear"
                style={{ width: `${Math.min(store.progress, 100)}%`, backgroundColor: 'var(--color-primary)' }}
              />
            </div>
          )}
          <div className="flex items-center justify-between mt-3 text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
            <span>{store.checked.toLocaleString()} {store.attackMode === 'mask' ? `/ ${store.total.toLocaleString()}` : t('crack.lines')}</span>
            <span>{t('crack.speed')}: {store.speed > 0 ? `${Math.round(store.speed).toLocaleString()} H/s` : '-'}</span>
          </div>
        </Card>
      )}

      {/* 结果面板 */}
      {store.found && (
        <div
          className="rounded-2xl p-5 border"
          style={{ backgroundColor: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}
            >
              <CheckCheck className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
            </div>
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{t('crack.found')}</div>
              <div className="text-lg font-mono font-semibold mt-0.5" style={{ color: 'var(--color-success)' }}>
                {store.found}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 日志终端 */}
      <Card title={`${t('crack.log')} (${t('crack.sanitized')})`} hover={false} className="border-zinc-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }} />
          <button
            onClick={store.clearLogs}
            className="flex items-center gap-1 text-xs transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Trash2 className="w-3 h-3" /> {t('crack.clear_log')}
          </button>
        </div>
        <div
          className="h-48 overflow-y-auto space-y-1 font-mono text-xs rounded-xl p-3"
          style={{ backgroundColor: '#18181b', color: '#a1a1aa' }}
        >
          {store.logs.length === 0 ? (
            <div className="text-zinc-600">[system] {t('crack.waiting')}</div>
          ) : (
            store.logs.map((line, i) => (
              <div key={i} className={line.includes('[RESULT]') ? 'text-green-400 font-medium' : ''}>
                {line}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </Card>
    </div>
  );
}

// 补一个 CheckCheck 图标如果 lucide 没有的话用下面这个内联
function CheckCheck(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 7 17l-5-5" /><path d="m22 10-7.5 7.5L13 16" />
    </svg>
  );
}