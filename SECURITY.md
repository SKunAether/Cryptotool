# Security Policy

## Supported Versions

| Version | Supported |
| :------ | :-------- |
| 1.0.x   | ✅         |
| < 1.0   | ❌         |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly:

1. **Do not** open a public GitHub issue.
2. Send an email to security@crypto-tool.app (or use GitHub's private vulnerability reporting if available).
3. Include a detailed description of the vulnerability, steps to reproduce, and potential impact.

We will acknowledge your report within 48 hours and work with you to resolve it promptly. We will coordinate disclosure and credit you if you wish.

## Security Measures

- **Zeroize**: All sensitive data (keys, plaintext) are zeroized after use.
- **Privacy Mode**: History stores only function names, never content.
- **Memory-only**: No sensitive data is written to disk (except settings).
- **Capability System**: Tauri permissions restrict access to system resources.
- **No telemetry**: No data is sent externally unless AI analysis is explicitly enabled (future).

## Responsible Disclosure

We follow responsible disclosure practices and will publicly acknowledge security researchers who report valid issues after a fix is released.