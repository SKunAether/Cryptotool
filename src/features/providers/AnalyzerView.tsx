import { useState } from 'react';
import { invokeCmd } from '../../api';
import { useTranslation } from 'react-i18next';
import { Search, ShieldAlert, ShieldCheck, KeyRound } from 'lucide-react';
import { Card } from '../../components/common/Card';

export function AnalyzerView() {
  const { t } = useTranslation();
  const [hashInput, setHashInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [hashResults, setHashResults] = useState<string[]>([]);
  const [weakPwdResult, setWeakPwdResult] = useState<boolean | null>(null);
  const [weakKeyResult, setWeakKeyResult] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  const analyzeHash = async () => {
    if (!hashInput.trim()) return;
    try {
      setError('');
      const res = await invokeCmd<string[]>('identify_hash', { hash: hashInput.trim() });
      setHashResults(res);
      if (res.length === 0) setError(t('analyzer.not_recognized'));
    } catch (e: any) {
      setError(e.code || t('error.unknown'));
    }
  };

  const checkPassword = async () => {
    if (!passwordInput) return;
    try {
      const res = await invokeCmd<boolean>('check_weak_password', { password: passwordInput });
      setWeakPwdResult(res);
    } catch (e: any) {
      setError(e.code || t('error.unknown'));
    }
  };

  const checkKey = async () => {
    if (!keyInput.trim()) return;
    try {
      const res = await invokeCmd<boolean>('check_des_weak_key', { keyHex: keyInput });
      setWeakKeyResult(res);
    } catch (e: any) {
      setError(e.code || t('error.unknown'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* 哈希识别 */}
      <Card title={t('analyzer.hash_title')} icon={<Search className="w-4 h-4 text-blue-500" />}>
        <input
          type="text"
          value={hashInput}
          onChange={(e) => setHashInput(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono outline-none transition-colors focus:border-blue-400 mb-3"
          style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          placeholder={t('analyzer.hash_placeholder')}
        />
        <button
          onClick={analyzeHash}
          disabled={!hashInput.trim()}
          className="px-5 py-2 rounded-xl text-sm font-medium text-white transition-all active:scale-[0.98]"
          style={{ backgroundColor: 'var(--color-primary)', opacity: !hashInput.trim() ? 0.5 : 1 }}
        >
          {t('analyzer.analyze_btn')}
        </button>
        {hashResults.length > 0 && (
          <div
            className="mt-4 p-3.5 rounded-xl border space-y-1.5"
            style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
          >
            <div className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              {t('analyzer.possible_types')}
            </div>
            {hashResults.map((r) => (
              <div
                key={r}
                className="flex items-center gap-2 text-sm font-mono px-2.5 py-1.5 rounded-lg"
                style={{ backgroundColor: 'var(--color-card)' }}
              >
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-primary)' }} />
                <span style={{ color: 'var(--color-text-primary)' }}>{r}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 弱密码检测 */}
      <Card title={t('analyzer.weak_password_title')} icon={<ShieldAlert className="w-4 h-4 text-orange-500" />}>
        <input
          type="text"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-blue-400 mb-3"
          style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          placeholder={t('analyzer.password_placeholder')}
        />
        <button
          onClick={checkPassword}
          disabled={!passwordInput}
          className="px-5 py-2 rounded-xl text-sm font-medium text-white transition-all active:scale-[0.98]"
          style={{ backgroundColor: 'var(--color-primary)', opacity: !passwordInput ? 0.5 : 1 }}
        >
          {t('analyzer.check_btn')}
        </button>
        {weakPwdResult !== null && (
          <div
            className="mt-4 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium"
            style={{
              backgroundColor: weakPwdResult ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)',
              color: weakPwdResult ? 'var(--color-danger)' : 'var(--color-success)',
            }}
          >
            {weakPwdResult ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            {weakPwdResult ? t('analyzer.weak_password_yes') : t('analyzer.weak_password_no')}
          </div>
        )}
      </Card>

      {/* DES 弱密钥检测 */}
      <Card title={t('analyzer.weak_key_title')} icon={<KeyRound className="w-4 h-4 text-purple-500" />}>
        <input
          type="text"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono outline-none transition-colors focus:border-blue-400 mb-3"
          style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          placeholder={t('analyzer.key_placeholder')}
        />
        <button
          onClick={checkKey}
          disabled={!keyInput.trim()}
          className="px-5 py-2 rounded-xl text-sm font-medium text-white transition-all active:scale-[0.98]"
          style={{ backgroundColor: 'var(--color-primary)', opacity: !keyInput.trim() ? 0.5 : 1 }}
        >
          {t('analyzer.check_btn')}
        </button>
        {weakKeyResult !== null && (
          <div
            className="mt-4 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium"
            style={{
              backgroundColor: weakKeyResult ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)',
              color: weakKeyResult ? 'var(--color-danger)' : 'var(--color-success)',
            }}
          >
            {weakKeyResult ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            {weakKeyResult ? t('analyzer.weak_key_yes') : t('analyzer.weak_key_no')}
          </div>
        )}
      </Card>

      {error && (
        <div
          className="p-3.5 rounded-xl text-sm flex items-center gap-2"
          style={{ backgroundColor: 'rgba(239,68,68,0.06)', color: 'var(--color-danger)' }}
        >
          <ShieldAlert className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}