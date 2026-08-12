use cryptotool_plugin_sdk::{
    SecurityProvider, ProviderMetadata, ProviderCategory,
    ProviderRequest, ProviderResponse,
};

pub struct AnalyzerProvider;

impl SecurityProvider for AnalyzerProvider {
    fn metadata(&self) -> ProviderMetadata {
        ProviderMetadata {
            id: "analyzer".into(),
            name: "Analyzer Provider".into(),
            version: "0.1.0".into(),
            category: ProviderCategory::Analyzer,
            description: "Hash identification and password analysis.".into(),
            input_schema: serde_json::Value::Null,
            output_schema: serde_json::Value::Null,
        }
    }

    fn execute(&self, _request: ProviderRequest) -> ProviderResponse {
        ProviderResponse::default()
    }
}