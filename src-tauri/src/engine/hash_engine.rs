use hex;
use md5::Md5;
use sha2::{Digest, Sha256, Sha512};

/// 支持的哈希算法
pub enum HashAlgorithm {
    MD5,
    SHA256,
    SHA512,
}

/// 纯计算引擎：零依赖，零 IO
pub struct HashEngine;

impl HashEngine {
    /// 对字节数组计算哈希，返回十六进制字符串
    pub fn hash_bytes(algo: HashAlgorithm, data: &[u8]) -> String {
        match algo {
            HashAlgorithm::MD5 => {
                let mut hasher = Md5::new();
                hasher.update(data);
                hex::encode(hasher.finalize())
            }
            HashAlgorithm::SHA256 => {
                let mut hasher = Sha256::new();
                hasher.update(data);
                hex::encode(hasher.finalize())
            }
            HashAlgorithm::SHA512 => {
                let mut hasher = Sha512::new();
                hasher.update(data);
                hex::encode(hasher.finalize())
            }
        }
    }

    /// 对字符串计算哈希
    pub fn hash_string(algo: HashAlgorithm, input: &str) -> String {
        Self::hash_bytes(algo, input.as_bytes())
    }

    /// 对字节切片计算哈希（兼容旧接口）
    #[allow(dead_code)]
    pub fn hash(algo: HashAlgorithm, data: &[u8]) -> String {
        Self::hash_bytes(algo, data)
    }
}
