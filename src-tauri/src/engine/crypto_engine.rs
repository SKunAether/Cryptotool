use crate::utils::zeroize_utils::zeroize_array;
use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use rand::RngCore;

/// 加密：输入 32 字节密钥（引用），明文，返回 Base64(nonce||ciphertext)
pub fn encrypt_aes256_gcm(key: &[u8; 32], plaintext: &str) -> Result<String, String> {
    let mut key_copy = [0u8; 32];
    key_copy.copy_from_slice(key);
    let cipher = Aes256Gcm::new_from_slice(&key_copy).map_err(|e| format!("Invalid key: {}", e))?;
    // 立即清除密钥副本
    zeroize_array(&mut key_copy);

    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_bytes())
        .map_err(|e| format!("Encryption failed: {}", e))?;

    let mut combined = Vec::with_capacity(12 + ciphertext.len());
    combined.extend_from_slice(&nonce_bytes);
    combined.extend_from_slice(&ciphertext);

    Ok(BASE64.encode(&combined))
}

/// 解密：输入 Base64(nonce||ciphertext)，返回明文
pub fn decrypt_aes256_gcm(key: &[u8; 32], encoded: &str) -> Result<String, String> {
    let mut key_copy = [0u8; 32];
    key_copy.copy_from_slice(key);
    let cipher = Aes256Gcm::new_from_slice(&key_copy).map_err(|e| format!("Invalid key: {}", e))?;
    zeroize_array(&mut key_copy);

    let combined = BASE64
        .decode(encoded)
        .map_err(|e| format!("Base64 decode failed: {}", e))?;

    if combined.len() < 12 {
        return Err("Ciphertext too short".into());
    }

    let (nonce_bytes, ciphertext) = combined.split_at(12);
    let nonce = Nonce::from_slice(nonce_bytes);

    let plaintext_bytes = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| format!("Decryption failed: {}", e))?;

    // 转换为 String，同时安全清理 Vec
    let result = String::from_utf8(plaintext_bytes).map_err(|e| format!("Invalid UTF-8: {}", e))?;
    // 注意：plaintext_bytes 已被消费，无需额外清理
    Ok(result)
}
