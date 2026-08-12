import { useParams } from 'react-router-dom';
import { CryptoView } from './CryptoView';
import { CrackView } from './CrackView';
import { AnalyzerView } from './AnalyzerView';

export function ProviderPage() {
  const { id } = useParams<{ id: string }>();

  if (id === 'crypto') return <CryptoView />;
  if (id === 'crack') return <CrackView />;
  if (id === 'analyzer') return <AnalyzerView />;

  return (
    <div
      className="rounded-2xl p-10 border text-center"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        Provider: {id}
      </h3>
      <p style={{ color: 'var(--color-text-secondary)' }}>该模块正在开发中...</p>
    </div>
  );
}