# Roadmap

## ✅ v1.0.0 (Current)

- Core architecture: Provider-First, Command-Service-Provider-Engine layers
- Hash, Crypto, Crack, Analyzer Providers
- Memory-only history (non-persistent)
- Theme & language settings
- Privacy mode
- System tray
- Check for updates
- Plugin SDK

## 🚧 v1.1.0 (Planned)

- **File Provider**: Stream-based encoding/decoding, large file hashing
- **Plugin dynamic loading**: Load external Providers via dynamic library (libloading/WASM)
- **Performance benchmarks**: Criterion for hash/crypto/crack
- **Frontend unit tests**: Vitest + React Testing Library for stores and components
- **Better error handling**: Detailed error codes and user-friendly messages

## 🔮 v1.2.0+ (Future)

- **GPU acceleration**: CUDA/OpenCL backend for crack engine
- **National cryptographic algorithms**: SM2, SM3, SM4
- **Plugin marketplace UI**: Browse and install third-party Providers
- **Auto-updater**: Seamless updates with progress and rollback
- **Audit log viewer**: Detailed history with export
- **Cross-platform CI**: Test on Windows, Linux, macOS
- **File Watcher**: Real-time file integrity monitoring (optional)

## 📌 Long-term Vision

- **Full-featured security platform**: Beyond cryptography, integrate system security tools
- **Community-driven plugin ecosystem**: Allow users to share and rate Providers
- **Enterprise features**: Role-based access, centralized policy management (SaaS optional)