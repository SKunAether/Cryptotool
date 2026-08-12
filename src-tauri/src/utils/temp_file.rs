#![allow(dead_code)]

use std::path::{Path, PathBuf};
use std::sync::OnceLock;
use tempfile::TempDir;

/// 获取全局临时目录，程序退出时自动清理
pub fn get_temp_dir() -> &'static Path {
    static TEMP_DIR: OnceLock<TempDir> = OnceLock::new();
    TEMP_DIR
        .get_or_init(|| TempDir::new().expect("Failed to create temp dir"))
        .path()
}

/// 在临时目录中创建一个新文件，返回路径
pub fn create_temp_file(prefix: &str, suffix: &str) -> PathBuf {
    let dir = get_temp_dir();
    dir.join(format!("{}{}", prefix, suffix))
}
