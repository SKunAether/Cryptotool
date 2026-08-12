pub mod types;

use serde::{Serialize};

pub trait SecurityProvider: Send + Sync {
    fn metadata(&self) -> ProviderMetadata;
    fn execute(&self, request: ProviderRequest) -> ProviderResponse;
}

#[derive(Debug, Clone, Serialize)]
pub struct ProviderMetadata {
    pub id: String,
    pub name: String,
    pub version: String,
    pub category: ProviderCategory,
    pub description: String,
    pub input_schema: serde_json::Value,
    pub output_schema: serde_json::Value,
}

#[derive(Debug, Clone, Serialize)]
pub enum ProviderCategory { Hash, Crypto, Analyzer, Crack, File, Other }

#[derive(Default)]
pub struct ProviderRequest {}

#[derive(Default)]
pub struct ProviderResponse {}

#[derive(Debug, Default)]
pub struct AppError {}