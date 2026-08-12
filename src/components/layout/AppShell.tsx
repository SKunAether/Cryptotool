import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  badge?: string;
  showBack?: boolean;
}

export function AppShell({ children, title, badge, showBack }: AppShellProps) {
  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} badge={badge} showBack={showBack} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}