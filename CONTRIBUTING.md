# Contributing to MBSE Benchmark

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/mbse_benchmark.git`
3. Install dependencies: `bun install`
4. Create a branch: `git checkout -b feature/your-feature`

## Development

```bash
# Run tests
bun test

# Run linter
bun run lint

# Format code
bun run format

# Run the CLI
bun run bench --help
```

## Pull Request Process

1. Ensure all tests pass: `bun test`
2. Ensure code is linted: `bun run lint`
3. Update documentation if needed
4. Fill out the PR template completely
5. Request review from maintainers

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Write tests for new functionality
- Keep functions small and focused
- Prefer removing code over adding code

## Commit Messages

Use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test changes
- `chore:` Maintenance tasks

## Reporting Issues

- Check existing issues first
- Use issue templates when available
- Provide reproduction steps
- Include environment details

## Code of Conduct

Be respectful and inclusive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).
