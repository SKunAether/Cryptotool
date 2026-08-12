use rayon::prelude::*;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use sha2::{Sha256, Digest};
use md5::Md5;

pub struct MaskGenerator {
    charset: Vec<Vec<u8>>,
    total_combinations: u64,
}

impl MaskGenerator {
    pub fn new(mask: &str) -> Self {
        let mut charset = Vec::new();
        let chars: Vec<char> = mask.chars().collect();
        let mut i = 0;
        while i < chars.len() {
            if chars[i] == '?' && i + 1 < chars.len() {
                let next = chars[i + 1];
                let set = match next {
                    'd' => b"0123456789".to_vec(),
                    'l' => b"abcdefghijklmnopqrstuvwxyz".to_vec(),
                    'u' => b"ABCDEFGHIJKLMNOPQRSTUVWXYZ".to_vec(),
                    'a' => b"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".to_vec(),
                    '?' => vec![b'?'],   // ?? 转义为单个 ?
                    other => vec![b'?', other as u8], // 无效组合，保留原样
                };
                charset.push(set);
                i += 2; // 跳过 ? 和类型字符
            } else {
                // 普通字符，作为固定字符
                charset.push(vec![chars[i] as u8]);
                i += 1;
            }
        }
        let total = charset.iter().map(|c| c.len() as u64).product();
        Self { charset, total_combinations: total }
    }

    pub fn total_combinations(&self) -> u64 {
        self.total_combinations
    }

    /// 分块生成候选字符串（闭区间 [start, start+count)）
    pub fn generate_block(&self, start: u64, count: u64) -> Vec<String> {
        let mut results = Vec::with_capacity(count as usize);
        if self.charset.is_empty() {
            return results;
        }
        let mut indices = vec![0u8; self.charset.len()];
        let mut remaining = start;
        for i in (0..indices.len()).rev() {
            let base = self.charset[i].len() as u64;
            indices[i] = (remaining % base) as u8;
            remaining /= base;
        }
        for _ in 0..count {
            let candidate: String = indices.iter().enumerate()
                .map(|(i, &idx)| self.charset[i][idx as usize] as char)
                .collect();
            results.push(candidate);
            // 递增索引
            for i in (0..indices.len()).rev() {
                indices[i] += 1;
                if (indices[i] as usize) < self.charset[i].len() {
                    break;
                }
                indices[i] = 0;
            }
        }
        results
    }
}

/// 计算目标哈希（根据算法类型）
pub fn hash_plaintext(algo: &str, plain: &str) -> String {
    match algo {
        "md5" => {
            let mut hasher = Md5::new();
            hasher.update(plain.as_bytes());
            format!("{:x}", hasher.finalize())
        }
        "sha256" => {
            let mut hasher = Sha256::new();
            hasher.update(plain.as_bytes());
            format!("{:x}", hasher.finalize())
        }
        _ => unimplemented!(),
    }
}

/// 并行执行爆破任务块
pub fn crack_block(
    algo: &str,
    target_hash: &str,
    candidates: Vec<String>,
    cancel_flag: Arc<AtomicBool>,
) -> Option<String> {
    candidates.par_iter().find_map_any(|plain| {
        if cancel_flag.load(Ordering::Relaxed) {
            return None;
        }
        if hash_plaintext(algo, plain) == target_hash {
            Some(plain.clone())
        } else {
            None
        }
    })
}