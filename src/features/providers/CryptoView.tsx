import { useState } from 'react';
import { invokeCmd } from '../../api';
import { useTranslation } from 'react-i18next';
import { Lock, Copy, CheckCheck } from 'lucide-react';
import { Card } from '../../components/common/Card';

export function CryptoView() {
  const { t } = useTranslation();
  const [key, setKey] = useState('');
  const [plaintext, setPlaintext] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [decrypted, setDecrypted] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [copied, setCopied] = useState(false);

  const handleGenerateKey = async () => {
    const newKey = await invokeCmd<string>('generate_aes_key');
    setKey(newKey);
  };

  const handleEncrypt = async () => {
    if (!key.trim() || !plaintext.trim()) return;
    const result = await invokeCmd<string>('aes_encrypt', { keyB64: key, plaintext });
    setCiphertext(result);
  };

  const handleDecrypt = async () => {
    if (!key.trim() || !ciphertext.trim()) return;
    const result = await invokeCmd<string>('aes_decrypt', { keyB64: key, ciphertextB64: ciphertext });
    setDecrypted(result);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card
        title={t('crypto.title')}
        icon={<Lock className="w-4 h-4 text-blue-500" />}
        action={
          <div className="flex rounded-lg p-0.5" style={{ backgroundColor: 'var(--color-background)' }}>
            <button
              onClick={() => setMode('encrypt')}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all"
              style={{
                backgroundColor: mode === 'encrypt' ? 'var(--color-primary)' : 'transparent',
                color: mode === 'encrypt' ? '#fff' : 'var(--color-text-secondary)',
              }}
            >
              {t('crypto.encrypt')}
            </button>
            <button
              onClick={() => setMode('decrypt')}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all"
              style={{
                backgroundColor: mode === 'decrypt' ? 'var(--color-primary)' : 'transparent',
                color: mode === 'decrypt' ? '#fff' : 'var(--color-text-secondary)',
              }}
            >
              {t('crypto.decrypt')}
            </button>
          </div>
        }
      >
        {/* 密钥行 */}
        <div className="mb-5">
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            {t('crypto.key_label')}
          </label>
          <div className="flex gap-2">
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border text-sm font-mono outline-none transition-colors focus:border-blue-400"
              style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              placeholder={t('crypto.key_placeholder')}
            />
            <button
              onClick={handleGenerateKey}
              className="px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors active:scale-[0.98]"
              style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-card)'}
            >
              {t('crypto.generate')}
            </button>
          </div>
        </div>

        {mode === 'encrypt' ? (
          <>
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                {t('crypto.plaintext')}
              </label>
              <textarea
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
                className="w-full h-32 p-3.5 rounded-xl border resize-none text-sm outline-none transition-colors focus:border-blue-400"
                style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                placeholder={t('crypto.plaintext_placeholder')}
              />
            </div>
            <button
              onClick={handleEncrypt}
              disabled={!key.trim() || !plaintext.trim()}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--color-primary)',
                opacity: !key.trim() || !plaintext.trim() ? 0.5 : 1,
              }}
            >
              {t('crypto.encrypt_btn')}
            </button>
            {ciphertext && (
              <div className="mt-4 p-4 rounded-xl border relative group" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {t('crypto.ciphertext')}
                </label>
                <code className="text-sm font-mono break-all" style={{ color: 'var(--color-text-primary)' }}>
                  {ciphertext}
                </code>
                <button
                  onClick={() => copyToClipboard(ciphertext)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  style={{ backgroundColor: 'var(--color-card)', border: `1px solid var(--color-border)` }}
                  title="复制"
                >
                  {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" style={{ color: 'var(--color-text-secondary)' }} />}
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                {t('crypto.ciphertext')}
              </label>
              <textarea
                value={ciphertext}
                onChange={(e) => setCiphertext(e.target.value)}
                className="w-full h-32 p-3.5 rounded-xl border resize-none text-sm font-mono outline-none transition-colors focus:border-blue-400"
                style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                placeholder={t('crypto.ciphertext_placeholder')}
              />
            </div>
            <button
              onClick={handleDecrypt}
              disabled={!key.trim() || !ciphertext.trim()}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--color-primary)',
                opacity: !key.trim() || !ciphertext.trim() ? 0.5 : 1,
              }}
            >
              {t('crypto.decrypt_btn')}
            </button>
            {decrypted && (
              <div className="mt-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {t('crypto.plaintext')}
                </label>
                <code className="text-sm font-mono break-all" style={{ color: 'var(--color-text-primary)' }}>
                  {decrypted}
                </code>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}