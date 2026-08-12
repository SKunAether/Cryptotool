// Crack Provider placeholder
use cryptotool_plugin_sdk::{
    SecurityProvider, ProviderMetadata, ProviderCategory,
    ProviderRequest, ProviderResponse,
};

pub struct CrackProvider;

impl SecurityProvider for CrackProvider {
    fn metadata(&self) -> ProviderMetadata {
        ProviderMetadata {
            id: "crack".into(),
            name: "Crack Provider".into(),
            version: "0.1.0".into(),
            category: ProviderCategory::Crack,
            description: "高性能掩码/字典爆破引擎".into(),
            input_schema: serde_json::Value::Null,
            output_schema: serde_json::Value::Null,
        }
    }

    fn execute(&self, _request: ProviderRequest) -> ProviderResponse {
        ProviderResponse::default()
    }
}