use cryptotool_plugin_sdk::{
    SecurityProvider, ProviderMetadata, ProviderCategory,
    ProviderRequest, ProviderResponse,
};

pub struct HashProvider;

impl SecurityProvider for HashProvider {
    fn metadata(&self) -> ProviderMetadata {
        ProviderMetadata {
            id: "hash".into(),
            name: "Hash Provider".into(),
            version: "0.1.0".into(),
            category: ProviderCategory::Hash,
            description: "Provides hashing and HMAC capabilities.".into(),
            input_schema: serde_json::Value::Null,
            output_schema: serde_json::Value::Null,
        }
    }

    fn execute(&self, _request: ProviderRequest) -> ProviderResponse {
        ProviderResponse::default()
    }
}