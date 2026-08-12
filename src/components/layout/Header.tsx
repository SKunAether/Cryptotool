import { Minus, Square, X, Moon, Sun, ArrowLeft } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useThemeStore } from "../../stores/themeStore";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

interface HeaderProps {
  title?: string;
  badge?: string;
  showBack?: boolean;
}

export function Header({ title = 'CryptoTool', badge, showBack }: HeaderProps) {
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const theme = useThemeStore((s) => s.theme);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMaximized, setIsMaximized] = useState(false);
  const [appWindow, setAppWindow] = useState<any>(null);

  useEffect(() => {
    // 获取窗口实例并初始化状态
    const win = getCurrentWindow();
    setAppWindow(win);
    if (win) {
      win.isMaximized().then(setIsMaximized).catch(() => { });
      const unlisten = win.onResized(async () => {
        const max = await win.isMaximized();
        setIsMaximized(max);
      });
      return () => { unlisten.then(fn => fn()); };
    }
  }, []);

  const handleMinimize = () => appWindow?.minimize();
  const handleMaximize = () => appWindow?.toggleMaximize();
  const handleClose = () => appWindow?.close();

  return (
    <header
      className="h-12 w-full flex items-center justify-between select-none shrink-0 px-4"
      style={{
        backgroundColor: 'var(--color-header-bg)',
        borderBottom: `1px solid var(--color-header-border)`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div data-tauri-drag-region className="flex items-center gap-2 h-full flex-1 min-w-0">
        {showBack && location.pathname !== '/' && (
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-md transition-colors mr-1"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </span>
        {badge && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-md font-medium shrink-0"
            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-center gap-0.5 h-full shrink-0">
        <button className="title-btn" onClick={toggleTheme} title="切换主题">
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <div className="w-px h-4 mx-1.5" style={{ backgroundColor: 'var(--color-border)' }} />
        <button className="title-btn" onClick={handleMinimize}>
          <Minus size={16} />
        </button>
        <button className="title-btn" onClick={handleMaximize}>
          {isMaximized ? (
            <Square size={13} strokeWidth={1.5} />
          ) : (
            <Square size={13} />
          )}
        </button>
        <button className="title-btn close-btn" onClick={handleClose}>
          <X size={16} />
        </button>
      </div>
    </header>
  );
}