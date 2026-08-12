use std::fs::File;
use std::io::{BufRead, BufReader, Seek, SeekFrom};
use std::path::Path;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

/// 字典文件流式读取器，记录偏移量，可暂停恢复
pub struct DictionaryReader {
    reader: BufReader<File>,
    current_offset: u64,
    total_bytes: u64,
    cancel_flag: Arc<AtomicBool>,
}

impl DictionaryReader {
    pub fn new(path: &Path, cancel_flag: Arc<AtomicBool>) -> Result<Self, String> {
        let file = File::open(path).map_err(|e| format!("无法打开文件: {}", e))?;
        let total_bytes = file.metadata().map(|m| m.len()).unwrap_or(0);
        let reader = BufReader::new(file);
        Ok(DictionaryReader {
            reader,
            current_offset: 0,
            total_bytes,
            cancel_flag,
        })
    }

    /// 读取下一个块（最多 max_lines 行），返回行列表和是否结束
    pub fn read_block(&mut self, max_lines: usize) -> Result<(Vec<String>, bool), String> {
        if self.cancel_flag.load(Ordering::Relaxed) {
            return Ok((vec![], true));
        }

        let mut lines = Vec::with_capacity(max_lines);
        let mut line = String::new();
        for _ in 0..max_lines {
            if self.cancel_flag.load(Ordering::Relaxed) {
                break;
            }
            line.clear();
            let bytes = self
                .reader
                .read_line(&mut line)
                .map_err(|e| format!("读取错误: {}", e))?;
            if bytes == 0 {
                break;
            }
            // 去掉换行符（直接传递数组，去掉引用）
            let trimmed = line.trim_end_matches(['\n', '\r']).to_string();
            if !trimmed.is_empty() {
                lines.push(trimmed);
            }
        }
        self.current_offset = self
            .reader
            .stream_position()
            .map_err(|e| format!("获取位置失败: {}", e))?;
        let eof = self.current_offset >= self.total_bytes;
        Ok((lines, eof))
    }

    /// 保存当前偏移量，用于暂停恢复
    pub fn save_offset(&self) -> u64 {
        self.current_offset
    }

    /// 从指定偏移量继续读取（恢复时调用）
    pub fn seek_to(&mut self, offset: u64) -> Result<(), String> {
        self.reader
            .seek(SeekFrom::Start(offset))
            .map_err(|e| format!("seek 失败: {}", e))?;
        self.current_offset = offset;
        Ok(())
    }
}
