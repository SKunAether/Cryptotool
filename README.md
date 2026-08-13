# CryptoTool

**Security Computing Platform for Cryptography & Security Research**

[![CI](https://github.com/SKunAether/Cryptotool/actions/workflows/ci.yml/badge.svg)](https://github.com/SKunAether/Cryptotool/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**English** | [简体中文](README.zh-CN.md)

## 📋 Introduction

CryptoTool is a modern, cross-platform security computing platform designed for security researchers, CTF players, and cryptography engineers. It integrates cryptographic computation, cryptanalysis, weak password detection, file security processing, CTF-assisted analysis, and a plugin ecosystem into a single, high-performance desktop application.

Unlike traditional algorithm toolkits, CryptoTool adopts a **Provider-First architecture** – all capabilities are abstracted as Providers, which are dynamically registered and managed by the Runtime. The core computation engine is written in Rust for high performance and memory safety.

## ✨ Key Features

| Feature                | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| 🔐 **Hash Calculation** | MD5, SHA256, SHA512 with KAT verification                    |
| 🔑 **Symmetric Crypto** | AES-256-GCM encryption/decryption with random key generation |
| 💥 **Crack Engine**     | Mask-based and dictionary-based attacks with pause/resume/stop support |
| 🔍 **Analyzer**         | Hash type identification, weak password & DES weak key detection |
| 🎨 **Theme & Language** | Light/Dark/System themes, Chinese/English switching          |
| 🛡️ **Privacy Mode**     | History stores only function usage, not content              |
| 🔌 **Plugin SDK**       | Extend functionality with external Providers (future)        |
| ⚡ **High Performance** | Rust + Rayon parallel processing, SIMD optimization          |
| 📦 **Cross-Platform**   | Windows, Linux, macOS support (Tauri 2)                      |
| 📜 **Auditable**        | Full operation history (in-memory, cleared on exit)          |

## 🚀 Quick Start

### End Users (Download Installer)

Visit the [Releases page](https://github.com/SKunAether/Cryptotool/releases) and download the package for your platform:

- **Windows**: `.msi` or `.exe`
- **Linux**: `.deb` or `.AppImage`
- **macOS**: `.dmg`

Run the installer and launch CryptoTool from your applications menu.

### Developers (Build from Source)

#### Prerequisites

- Windows 10/11, Linux (with GTK), or macOS
- Rust 1.80+ (with Cargo)
- Node.js 20+ and pnpm
- WebView2 (Windows) / WebKitGTK (Linux) / WebKit (macOS)

#### Setup

```bash
# Clone repository
git clone https://github.com/SKunAether/Cryptotool.git
cd Cryptotool

# Install frontend dependencies
pnpm install

# Run development mode
pnpm tauri dev

# Build production installer
pnpm tauri build
```



Build outputs are located in `src-tauri/target/release/bundle/`.

## 📂 Project Structure

```
CryptoTool/
├── src/                     # React frontend (TypeScript + Tailwind)
│   ├── api/                 # Tauri invoke wrappers
│   ├── components/          # Reusable UI components
│   ├── features/            # Feature pages (Dashboard, Hash, Crypto, etc.)
│   ├── stores/              # Zustand state management
│   ├── locales/             # i18n language files (zh-CN, en-US)
│   └── ...
├── src-tauri/               # Tauri backend (Rust)
│   ├── src/
│   │   ├── commands/        # Tauri commands exposed to frontend
│   │   ├── services/        # Business logic layer
│   │   ├── providers/       # Built-in Provider implementations
│   │   ├── engine/          # Pure computation engine (no I/O)
│   │   ├── task/            # Task runtime (pause/resume/cancel)
│   │   ├── storage/         # SQLite persistence (for settings/audit)
│   │   └── utils/           # Utilities (temp files, zeroize)
│   └── Cargo.toml
├── plugin-sdk/              # SDK for external Provider development
├── tests/                   # KAT tests and integration tests
├── benchmarks/              # Criterion performance benchmarks
└── docs/                    # Additional documentation
```



## 🛠️ Built-in Providers

| Provider     | Capabilities                                                 |
| :----------- | :----------------------------------------------------------- |
| **Hash**     | MD5, SHA256, SHA512 (text input)                             |
| **Crypto**   | AES-256-GCM encrypt/decrypt, random key generation           |
| **Crack**    | Mask (`?d`, `?l`, `?u`, `?a`) and dictionary attacks         |
| **Analyzer** | Hash type identification, weak password rules, DES weak key detection |
| **Encode**   | (Coming soon) Base64, Hex, URL encoding                      |

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## 🗺️ Roadmap

See [ROADMAP.md](ROADMAP.md) for future development plans.

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

Built with ❤️ using React, Tauri, and Rust.
Special thanks to all contributors and users.

## 🔗 Links

- [Official Website](https://crypto-tool.app/)
- [GitHub Repository](https://github.com/SKunAether/Cryptotool)
- [Releases](https://github.com/SKunAether/Cryptotool/releases)
