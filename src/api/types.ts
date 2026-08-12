// IPC DTO 类型定义，必须与 Rust 端结构体同步
export interface AppError {
  code: string;
  params: string[];
  severity: 'error' | 'warning';
}
