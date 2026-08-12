use crate::engine::crypto_engine;
use crate::error::{AppError, ErrorSeverity};

pub struct CryptoService;

impl CryptoService {
    /// 生成随机 32 字节密钥（Base64 编码返回）
    pub fn generate_key() -> String {
        use rand::RngCore;
        let mut key = [0u8; 32];
        rand::rngs::OsRng.fill_bytes(&mut key);
        base64::Engine::encode(&base64::engine::general_purpose::STANDARD, &key)
    }

    /// AES-256-GCM 加密
    pub fn encrypt(key_b64: &str, plaintext: &str) -> Result<String, AppError> {
        let key_bytes = decode_key(key_b64)?;
        crypto_engine::encrypt_aes256_gcm(&key_bytes, plaintext)
            .map_err(|e| AppError::with_params(
                "crypto.encrypt_failed",
                vec![e],
                ErrorSeverity::Error,
            ))
    }

    /// AES-256-GCM 解密
    pub fn decrypt(key_b64: &str, ciphertext_b64: &str) -> Result<String, AppError> {
        let key_bytes = decode_key(key_b64)?;
        crypto_engine::decrypt_aes256_gcm(&key_bytes, ciphertext_b64)
            .map_err(|e| AppError::with_params(
                "crypto.decrypt_failed",
                vec![e],
                ErrorSeverity::Error,
            ))
    }
}

fn decode_key(b64: &str) -> Result<[u8; 32], AppError> {
    use base64::Engine;
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(b64)
        .map_err(|e| AppError::with_params(
            "crypto.invalid_key",
            vec![e.to_string()],
            ErrorSeverity::Error,
        ))?;

    if bytes.len() != 32 {
        return Err(AppError::with_params(
            "crypto.invalid_key_length",
            vec!["32".into(), bytes.len().to_string()],
            ErrorSeverity::Error,
        ));
    }

    let mut key = [0u8; 32];
    key.copy_from_slice(&bytes);
    Ok(key)
}