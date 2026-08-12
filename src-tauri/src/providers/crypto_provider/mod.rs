use cryptotool_plugin_sdk::{
    SecurityProvider, ProviderMetadata, ProviderCategory,
    ProviderRequest, ProviderResponse,
};

pub struct CryptoProvider;

impl SecurityProvider for CryptoProvider {
    fn metadata(&self) -> ProviderMetadata {
        ProviderMetadata {
            id: "crypto".into(),
            name: "Crypto Provider".into(),
            version: "0.1.0".into(),
            category: ProviderCategory::Crypto,
            description: "Provides symmetric/asymmetric encryption and KDF.".into(),
            input_schema: serde_json::Value::Null,
            output_schema: serde_json::Value::Null,
        }
    }

    fn execute(&self, _request: ProviderRequest) -> ProviderResponse {
        ProviderResponse::default()
    }
}