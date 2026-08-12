import { Code } from 'lucide-react';
import { Card } from '../../components/common/Card';

export function EncodeView() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card title="编码转换" icon={<Code className="w-4 h-4 text-purple-500" />} hover={false}>
        <div className="py-12 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(139,92,246,0.08)' }}
          >
            <Code className="w-8 h-8" style={{ color: '#8b5cf6' }} />
          </div>
          <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            编码转换
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            即将推出 Base64、Hex、URL 编码等转换功能
          </p>
        </div>
      </Card>
    </div>
  );
}