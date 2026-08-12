/// 启发式识别哈希类型，返回可能的算法列表
pub fn identify_hash(hash: &str) -> Vec<String> {
    let mut results = Vec::new();
    let len = hash.len();

    if len == 32 && hash.chars().all(|c| c.is_ascii_hexdigit()) {
        results.push("MD5".to_string());
        results.push("MD4".to_string());
    }
    if len == 40 && hash.chars().all(|c| c.is_ascii_hexdigit()) {
        results.push("SHA-1".to_string());
    }
    if len == 56 && hash.chars().all(|c| c.is_ascii_hexdigit()) {
        results.push("SHA-224".to_string());
    }
    if len == 64 && hash.chars().all(|c| c.is_ascii_hexdigit()) {
        results.push("SHA-256".to_string());
        results.push("SHA3-256".to_string());
        results.push("SM3".to_string());
    }
    if len == 96 && hash.chars().all(|c| c.is_ascii_hexdigit()) {
        results.push("SHA-384".to_string());
        results.push("SHA3-384".to_string());
    }
    if len == 128 && hash.chars().all(|c| c.is_ascii_hexdigit()) {
        results.push("SHA-512".to_string());
        results.push("SHA3-512".to_string());
    }
    if hash.starts_with("$2a$") || hash.starts_with("$2b$") || hash.starts_with("$2y$") {
        results.push("bcrypt".to_string());
    }
    if hash.starts_with("$argon2") {
        results.push("Argon2".to_string());
    }

    results
}

/// 检查是否为弱密码（简单规则）
pub fn is_weak_password(password: &str) -> bool {
    let len = password.len();
    if len < 6 {
        return true;
    }
    // 纯数字或纯字母且长度不足
    if password.chars().all(|c| c.is_ascii_digit()) && len < 8 {
        return true;
    }
    if password.chars().all(|c| c.is_ascii_lowercase()) && len < 8 {
        return true;
    }
    false
}

/// 检查是否是常见的 DES 弱密钥
pub fn is_des_weak_key(key_bytes: &[u8]) -> bool {
    let weak_keys: [[u8; 8]; 4] = [
        [0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01],
        [0xFE, 0xFE, 0xFE, 0xFE, 0xFE, 0xFE, 0xFE, 0xFE],
        [0xE0, 0xE0, 0xE0, 0xE0, 0xF1, 0xF1, 0xF1, 0xF1],
        [0x1F, 0x1F, 0x1F, 0x1F, 0x0E, 0x0E, 0x0E, 0x0E],
    ];
    if key_bytes.len() != 8 {
        return false;
    }
    for wk in &weak_keys {
        if key_bytes == wk {
            return true;
        }
    }
    false
}