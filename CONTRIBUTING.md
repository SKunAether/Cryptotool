# Contributing to CryptoTool

We welcome contributions from the community! Whether you're fixing a bug, adding a feature, or improving documentation, your help is appreciated.

## How to Contribute

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   git clone https://github.com/your-username/Cryptotool.git
   cd Cryptotool
3. **Create a branch** for your feature or fix:
   git checkout -b feature/your-feature-name
4. **Make your changes** following the code style guidelines.
5. **Test** your changes:
   cargo test --workspace
   pnpm test
6. **Commit** with a clear message:
   git commit -m "feat: add new hash algorithm support"
7. **Push** to your fork and open a Pull Request.

## Code Style

### Rust

- Use `rustfmt` (default settings).
- Run `cargo fmt` before committing.

### TypeScript / React

- Use ESLint and Prettier.
- Run `pnpm lint` and `pnpm format` before committing.

## Testing

- **Unit tests**: Located next to source files (`#[cfg(test)]`).
- **Integration tests**: In `tests/` directory.
- **Frontend tests**: Use Vitest (`pnpm test`).

## Pull Request Guidelines

- Keep PRs focused on a single logical change.
- Update documentation if necessary.
- Ensure all CI checks pass.
- Include relevant issue numbers if applicable.

## Reporting Issues

Please use the GitHub issue tracker. Provide:

- Steps to reproduce the issue.
- Expected vs actual behavior.
- Logs or screenshots if relevant.
- System environment (OS, version).

## Feature Requests

Describe the feature clearly, explain the use case, and why it would be valuable.

## Code of Conduct

By participating, you agree to abide by our Code of Conduct.

Thank you for contributing! 🎉