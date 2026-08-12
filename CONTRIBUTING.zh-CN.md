# 为 CryptoTool 贡献

欢迎社区贡献！无论是修复 Bug、添加功能还是改进文档，我们都非常感谢。

## 如何贡献

1. **Fork** 仓库。
2. **Clone** 到本地：
   git clone https://github.com/your-username/Cryptotool.git
   cd Cryptotool
3. **创建分支**：
   git checkout -b feature/your-feature-name
4. **进行修改**，遵循代码风格。
5. **测试**：
   cargo test --workspace
   pnpm test
6. **提交**：
   git commit -m "feat: 添加新的哈希算法支持"
7. **Push** 并创建 Pull Request。

## 代码风格

### Rust

- 使用 `rustfmt`（默认配置）。
- 提交前运行 `cargo fmt`。

### TypeScript / React

- 使用 ESLint 和 Prettier。
- 提交前运行 `pnpm lint` 和 `pnpm format`。

## 测试

- **单元测试**：与源码同目录（`#[cfg(test)]`）。
- **集成测试**：`tests/` 目录。
- **前端测试**：使用 Vitest（`pnpm test`）。

## Pull Request 指南

- 聚焦于单一逻辑变更。
- 必要时更新文档。
- 确保 CI 检查通过。
- 关联相关 Issue 编号。

## 报告问题

请使用 GitHub issue tracker。提供：

- 重现步骤。
- 预期与实际行为。
- 日志或截图。
- 系统环境（OS、版本）。

## 功能请求

清晰描述功能，解释使用场景和价值。

## 行为准则

参与即代表您同意遵守我们的行为准则。

感谢贡献！🎉