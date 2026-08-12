import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Hash, Lock, KeyRound, Shield, ArrowRight,
  Activity, CheckCircle2, Clock, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useHistoryStore } from '../../stores/historyStore';
import { useProviderStore } from '../../stores/providerStore';
import { useSettingStore } from '../../stores/settingStore';
import { invokeCmd } from '../../api';
import { Card } from '../../components/common/Card';

interface DashboardStats {
  today_operations: number;
  active_tasks: number;
  history_count: number;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const providerMeta: Record<string, { icon: React.ElementType; color: string }> = {
  hash: { icon: Hash, color: '#f97316' },
  crypto: { icon: Lock, color: '#3b82f6' },
  crack: { icon: KeyRound, color: '#ef4444' },
  analyzer: { icon: Shield, color: '#10b981' },
  encode: { icon: Zap, color: '#8b5cf6' },
};

export function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const historyEntries = useHistoryStore((s) => s.entries);
  const { providers } = useProviderStore();
  const { visibleProviders } = useSettingStore();

  const [stats, setStats] = useState<DashboardStats>({
    today_operations: 0,
    active_tasks: 0,
    history_count: 0,
  });

  useEffect(() => {
    invokeCmd<DashboardStats>('get_dashboard_stats')
      .then(setStats)
      .catch(() => { });
  }, [historyEntries]);

  // 实际历史数量 = store 中的 entries 数量
  const historyCount = historyEntries.length;

  const visibleList = providers.filter(p => visibleProviders.includes(p.id));

  return (
    <motion.div
      className="max-w-5xl mx-auto space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-3 gap-4">
        <StatCard icon={Activity} value={stats.today_operations.toLocaleString()} label={t('dashboard.today_ops')} />
        <StatCard icon={CheckCircle2} value={stats.active_tasks.toString()} label={t('dashboard.activeTasks')} />
        <StatCard icon={Clock} value={historyCount.toString()} label={t('dashboard.history')} />
      </motion.div>

      {/* Provider Grid */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {t('dashboard.providerList')}
          </h2>
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {visibleList.length} {t('dashboard.providers_total')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {visibleList.map((p) => {
            const meta = providerMeta[p.id] || { icon: Shield, color: '#6b7280' };
            const Icon = meta.icon;
            const desc = t(`provider.${p.id}.desc`);
            return (
              <button
                key={p.id}
                onClick={() => navigate(p.id === 'hash' ? '/hash' : p.id === 'crack' ? '/crack' : `/provider/${p.id}`)}
                className="group text-left rounded-2xl border p-4 transition-all duration-200"
                style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${meta.color}35`;
                  e.currentTarget.style.boxShadow = `0 4px 14px ${meta.color}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${meta.color}12` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: meta.color }} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[14px] truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {t(`provider.${p.id}.name`, p.name)}
                      </div>
                      <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>
                        {desc}
                      </div>
                    </div>
                  </div>
                  <ArrowRight
                    className="w-4 h-4 shrink-0 mt-2 transition-transform group-hover:translate-x-0.5"
                    style={{ color: 'var(--color-text-secondary)' }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Recent History */}
      {historyEntries.length > 0 && (
        <motion.div variants={item}>
          <Card title={t('dashboard.recent_history')} hover={false}>
            <div className="space-y-2">
              {historyEntries.slice(-5).reverse().map((item) => (
                <div
                  key={item.timestamp}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                  style={{ backgroundColor: 'rgba(0,0,0,0.015)' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: item.status === '成功' ? 'var(--color-success)' : 'var(--color-text-secondary)',
                      }}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {item.action}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: item.status === '成功' ? 'rgba(16,185,129,0.08)' : 'rgba(100,116,139,0.08)',
                      color: item.status === '成功' ? 'var(--color-success)' : 'var(--color-text-secondary)',
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

function StatCard({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(59,130,246,0.06)' }}
        >
          <Icon className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
        {value}
      </div>
    </div>
  );
}