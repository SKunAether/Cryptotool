use serde::Serialize;
use std::fmt;

#[derive(Debug, Serialize, Clone)]
pub struct AppError {
    pub code: String,
    pub params: Vec<String>,
    pub severity: ErrorSeverity,
}

#[derive(Debug, Serialize, Clone)]

#[allow(dead_code)]
pub enum ErrorSeverity {
    Error,
    Warning,
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "[{}] {} (params: {:?})",
            match self.severity {
                ErrorSeverity::Error => "ERROR",
                ErrorSeverity::Warning => "WARN",
            },
            self.code,
            self.params
        )
    }
}

impl std::error::Error for AppError {}

#[allow(dead_code)]
// 便捷构造器
impl AppError {
    pub fn new(code: &str, severity: ErrorSeverity) -> Self {
        Self {
            code: code.to_string(),
            params: vec![],
            severity,
        }
    }

    pub fn with_params(code: &str, params: Vec<String>, severity: ErrorSeverity) -> Self {
        Self {
            code: code.to_string(),
            params,
            severity,
        }
    }
}

// 从标准错误转换（方便在 Service 中使用 ?）
impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError::with_params(
            "system.io",
            vec![e.to_string()],
            ErrorSeverity::Error,
        )
    }
}