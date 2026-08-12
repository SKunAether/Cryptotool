use crate::engine::analyzer_engine;

pub struct AnalyzerService;

impl AnalyzerService {
    pub fn identify(hash: &str) -> Vec<String> {
        analyzer_engine::identify_hash(hash)
    }

    pub fn check_weak_password(password: &str) -> bool {
        analyzer_engine::is_weak_password(password)
    }

    pub fn check_des_weak_key(key_hex: &str) -> Result<bool, String> {
        let bytes = hex::decode(key_hex).map_err(|e| format!("无效的十六进制密钥: {}", e))?;
        Ok(analyzer_engine::is_des_weak_key(&bytes))
    }
}