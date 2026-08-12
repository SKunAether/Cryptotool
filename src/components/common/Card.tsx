interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  hover?: boolean;
}

export function Card({ title, description, children, className = '', action, icon, hover = true }: CardProps) {
  return (
    <div
      className={`rounded-2xl border p-5 ${className}`}
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        transition: hover ? 'all 0.2s ease' : undefined,
      }}
      {...(hover ? {
        onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)';
        },
        onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'var(--color-border)';
        },
      } : {})}
    >
      {(title || action || icon) && (
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(59,130,246,0.08)' }}
              >
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="font-semibold text-[15px] truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>
                  {description}
                </p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {/* 如果传了 title/description，给 children 加一点顶部间距 */}
      <div className={(title || description) ? 'mt-3' : ''}>
        {children}
      </div>
    </div>
  );
}