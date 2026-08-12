import { useEffect } from 'react';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';

export function useEventBus<T>(event: string, handler: (payload: T) => void) {
  useEffect(() => {
    let unlisten: UnlistenFn | undefined;
    listen<T>(event, (e) => handler(e.payload)).then(fn => (unlisten = fn));
    return () => { unlisten?.(); };
  }, [event, handler]);
}
