import { useState } from 'react';
import { invokeCmd } from '../../api';
import { useTranslation } from 'react-i18next';
import { Hash } from 'lucide-react';
import { Card } from '../../components/common/Card';

export function HashView() {
  const { t } = useTranslation();
  const [algorithm, setAlgorithm] = useState('sha256');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleHash = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await invokeCmd<string>('hash_string', { algorithm, text: input });
      setOutput(result);
    } catch (err: any) {
      setOutput(`${t('error.generic')}: ${err.code || t('error.unknown')}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card
        title={t('hash.title')}
        icon={<Hash className="w-4 h-4 text-blue-500" />}
        action={
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="px-3 py-1.5 rounded-lg border text-sm outline-none"
            style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          >
            <option value="md5">MD5</option>
            <option value="sha256">SHA-256</option>
            <option value="sha512">SHA-512</option>
          </select>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              {t('hash.input')}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-48 p-3.5 rounded-xl border resize-none text-sm font-mono outline-none transition-colors focus:border-blue-400"
              style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              placeholder={t('hash.placeholder')}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              {t('hash.output')}
            </label>
            <div
              className="w-full h-48 p-3.5 rounded-xl border overflow-auto"
              style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
            >
              <code className="text-sm font-mono break-all" style={{ color: output ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                {output || t('hash.waiting')}
              </code>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-5">
          <button
            onClick={handleHash}
            disabled={loading || !input.trim()}
            className="px-8 py-2.5 rounded-xl text-sm font-medium text-white transition-all active:scale-[0.98]"
            style={{
              backgroundColor: loading ? 'var(--color-text-secondary)' : 'var(--color-primary)',
              opacity: loading || !input.trim() ? 0.5 : 1,
            }}
          >
            {loading ? t('hash.computing') : t('hash.compute')}
          </button>
        </div>
      </Card>
    </div>
  );
}