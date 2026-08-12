import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapseCardProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapseCard({ icon, title, description, children, defaultOpen = false }: CollapseCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left transition-colors"
        style={{ color: 'var(--color-text-primary)' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.015)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(59,130,246,0.08)' }}
            >
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-semibold text-sm">{title}</div>
            {description && (
              <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>
                {description}
              </div>
            )}
          </div>
        </div>
        <ChevronDown
          className="w-4 h-4 shrink-0 ml-3 transition-transform duration-200"
          style={{
            color: 'var(--color-text-secondary)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      {open && (
        <div className="px-4 pb-4" style={{ borderTop: `1px solid var(--color-border)` }}>
          <div className="pt-3">{children}</div>
        </div>
      )}
    </div>
  );
}