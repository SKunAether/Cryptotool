use crate::providers::analyzer_provider::AnalyzerProvider;
use crate::providers::crack_provider::CrackProvider;
use crate::providers::crypto_provider::CryptoProvider;
use crate::providers::hash_provider::HashProvider;
use cryptotool_plugin_sdk::SecurityProvider;
use std::collections::HashMap;

pub struct ProviderRegistry {
    providers: HashMap<String, Box<dyn SecurityProvider>>,
}

impl ProviderRegistry {
    pub fn new() -> Self {
        let mut registry = Self {
            providers: HashMap::new(),
        };
        registry.register(Box::new(HashProvider));
        registry.register(Box::new(CryptoProvider));
        registry.register(Box::new(CrackProvider));
        registry.register(Box::new(AnalyzerProvider));
        registry
    }

    pub fn register(&mut self, provider: Box<dyn SecurityProvider>) {
        let id = provider.metadata().id.clone();
        self.providers.insert(id, provider);
    }

    // 返回 &dyn SecurityProvider 而不是 &Box<dyn SecurityProvider>
    pub fn get(&self, id: &str) -> Option<&dyn SecurityProvider> {
        self.providers.get(id).map(|b| b.as_ref())
    }

    pub fn list(&self) -> Vec<String> {
        self.providers.keys().cloned().collect()
    }
}
