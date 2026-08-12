import { invoke } from '@tauri-apps/api/core';
import type { AppError } from './types';


export async function invokeCmd<T>(
  cmd: string,
  args?: Record<string, unknown>
): Promise<T> {
  try {
    return await invoke<T>(cmd, args);
  } catch (err: any) {
    let appError: AppError = {
      code: 'unknown',
      params: [],
      severity: 'error',
    };
    if (typeof err === 'string') {
      try {
        const parsed = JSON.parse(err);
        if (parsed.code) {
          appError = parsed as AppError;
        }
      } catch {
        appError.params = [err];
      }
    }
    throw appError;
  }
}

export function formatError(error: AppError, t: (key: string, params?: any) => string): string {
  const template = t(`error.${error.code}`, { defaultValue: t('error.unknown') });
  if (error.params.length > 0) {
    return template.replace(/\{(\d+)\}/g, (_, index) => error.params[Number(index)] ?? '');
  }
  return template;
}