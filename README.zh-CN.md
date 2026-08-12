# CryptoTool

**面向安全研究与密码学的现代化安全计算平台**

[![CI](https://github.com/SKunAether/Cryptotool/actions/workflows/ci.yml/badge.svg)](https://github.com/SKunAether/Cryptotool/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[English](README.md) | **简体中文**

## 📋 简介

CryptoTool 是一个跨平台、高性能的安全计算平台，专为安全研究人员、CTF 玩家和密码工程师设计。它集密码计算、密码分析、弱密码检测、文件安全处理、CTF 辅助分析及插件生态于一体。

与传统工具箱不同，CryptoTool 采用 **Provider 优先架构**——所有能力抽象为 Provider，由运行时动态注册和管理。核心计算引擎使用 Rust 编写，确保高性能和内存安全。

## ✨ 主要特性

| 功能             | 描述                                     |
| ---------------- | ---------------------------------------- |
| 🔐 **哈希计算**   | MD5、SHA256、SHA512，通过 KAT 验证       |
| 🔑 **对称加密**   | AES-256-GCM 加解密，随机密钥生成         |
| 💥 **爆破引擎**   | 掩码与字典攻击，支持暂停/恢复/停止       |
| 🔍 **密码分析**   | 哈希类型识别、弱密码检测、DES 弱密钥检测 |
| 🎨 **主题与语言** | 浅色/深色/跟随系统主题，中英文切换       |
| 🛡️ **隐私模式**   | 历史记录仅记录功能使用，不保存具体内容   |
| 🔌 **插件 SDK**   | 支持扩展外部 Provider（未来）            |
| ⚡ **高性能**     | Rust + Rayon 并行处理，SIMD 优化         |
| 📦 **跨平台**     | 支持 Windows、Linux、macOS（Tauri 2）    |
| 📜 **可审计**     | 完整操作历史（内存存储，退出即清）       |

## 🚀 快速开始

### 终端用户（下载安装包）

访问 [Releases 页面](https://github.com/SKunAether/Cryptotool/releases)，下载对应平台的安装包：

- **Windows**: `.msi` 或 `.exe`
- **Linux**: `.deb` 或 `.AppImage`
- **macOS**: `.dmg`

运行安装程序，从应用菜单启动 CryptoTool。

### 开发者（从源码构建）

#### 环境要求

- Windows 10/11、Linux（带 GTK）或 macOS
- Rust 1.80+（含 Cargo）
- Node.js 20+ 和 pnpm
- WebView2（Windows）/ WebKitGTK（Linux）/ WebKit（macOS）

#### 构建步骤

```bash
# 克隆仓库
git clone https://github.com/SKunAether/Cryptotool.git
cd Cryptotool

# 安装前端依赖
pnpm install

# 运行开发模式
pnpm tauri dev

# 构建生产安装包
pnpm tauri build
```

构建产物位于 `src-tauri/target/release/bundle/`。

## 📂 项目结构

text

```
CryptoTool/
├── src/                     # React 前端 (TypeScript + Tailwind)
│   ├── api/                 # Tauri invoke 封装
│   ├── components/          # 可复用 UI 组件
│   ├── features/            # 功能页面（概览、哈希、加密等）
│   ├── stores/              # Zustand 状态管理
│   ├── locales/             # i18n 语言文件 (zh-CN, en-US)
│   └── ...
├── src-tauri/               # Tauri 后端 (Rust)
│   ├── src/
│   │   ├── commands/        # 暴露给前端的 Tauri 命令
│   │   ├── services/        # 业务逻辑层
│   │   ├── providers/       # 内置 Provider 实现
│   │   ├── engine/          # 纯计算引擎（无 I/O）
│   │   ├── task/            # 任务运行时（暂停/恢复/取消）
│   │   ├── storage/         # SQLite 持久化（设置/审计）
│   │   └── utils/           # 工具（临时文件、零化）
│   └── Cargo.toml
├── plugin-sdk/              # 外部 Provider 开发 SDK
├── tests/                   # KAT 测试和集成测试
├── benchmarks/              # Criterion 性能基准
└── docs/                    # 额外文档
```



## 🛠️ 内置 Provider

| Provider | 能力                                     |
| :------- | :--------------------------------------- |
| **哈希** | MD5、SHA256、SHA512（文本输入）          |
| **加密** | AES-256-GCM 加解密，随机密钥生成         |
| **破解** | 掩码（`?d`、`?l`、`?u`、`?a`）和字典攻击 |
| **分析** | 哈希类型识别、弱密码规则、DES 弱密钥检测 |
| **编码** | （即将推出）Base64、Hex、URL 编码        |

## 🤝 贡献

欢迎贡献！请阅读 [CONTRIBUTING.md](https://contributing.md/) 了解指南。

## 📝 更新日志

查看 [CHANGELOG.md](https://changelog.md/) 了解版本历史。

## 🗺️ 路线图

查看 [ROADMAP.md](https://roadmap.md/) 了解未来开发计划。

## 📄 许可证

本项目采用 MIT 许可证 – 详见 [LICENSE](https://license/) 文件。

## 🙏 致谢

用 ❤️ 和 React、Tauri、Rust 构建。
感谢所有贡献者和用户。

## 🔗 链接

- [官方网站](https://crypto-tool.app/)
- [GitHub 仓库](https://github.com/SKunAether/Cryptotool)
- [发布页面](https://github.com/SKunAether/Cryptotool/releases)