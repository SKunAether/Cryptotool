use crate::engine::hash_engine::{HashEngine, HashAlgorithm};
use crate::error::{AppError, ErrorSeverity};
use cryptotool_plugin_sdk::ProviderRequest;
use crate::providers::registry::ProviderRegistry;

pub struct HashService;

impl HashService {
    /// 通过 Provider Registry 执行哈希
    pub fn execute_via_provider(
        registry: &ProviderRegistry,
        algo: &str,
        text: &str,
    ) -> Result<String, AppError> {
        let provider = registry
            .get("hash")
            .ok_or_else(|| AppError::new("provider.not_found", ErrorSeverity::Error))?;

        let request = ProviderRequest::default(); // 后续可扩展参数
        let _response = provider.execute(request);

        // 暂时仍然直接调用 Engine，后续再改为 Provider 返回结果
        Self::hash_text(algo, text)
    }

    /// 计算文本哈希（直接调用引擎）
    pub fn hash_text(algo: &str, text: &str) -> Result<String, AppError> {
        let algorithm = parse_algorithm(algo)?;
        Ok(HashEngine::hash_string(algorithm, text))
    }

    /// 计算字节数组哈希
    pub fn hash_bytes(algo: &str, data: &[u8]) -> Result<String, AppError> {
        let algorithm = parse_algorithm(algo)?;
        Ok(HashEngine::hash_bytes(algorithm, data))
    }
}

fn parse_algorithm(name: &str) -> Result<HashAlgorithm, AppError> {
    match name.to_lowercase().as_str() {
        "md5" => Ok(HashAlgorithm::MD5),
        "sha256" => Ok(HashAlgorithm::SHA256),
        "sha512" => Ok(HashAlgorithm::SHA512),
        _ => Err(AppError::with_params(
            "crypto.unsupported_algorithm",
            vec![name.to_string()],
            ErrorSeverity::Error,
        )),
    }
}