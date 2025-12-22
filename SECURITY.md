# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by emailing the maintainer directly rather than opening a public issue.

**Please include:**

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We aim to respond within 48 hours and will work with you to understand and address the issue.

## Security Best Practices

This project follows these security practices:

1. **Dependency Management**: Regular updates via Dependabot
2. **Code Scanning**: Automated security scanning via GitHub Actions
3. **Secrets Management**: All API keys via environment variables, never committed
4. **Input Validation**: All user inputs are validated before processing
