# AI Agent Guidelines

Guidelines for AI agents contributing to this project.

## Core Principles

### 1. Removal Over Addition

- **Prefer deleting code** over writing new code
- Simplify existing implementations before adding complexity
- Question every new file, function, or dependency

### 2. Testability First

- All code must be testable in isolation
- Pure functions over stateful classes
- Dependency injection for external services
- Mock boundaries at module edges

### 3. Minimal Changes

- Make the smallest possible change
- One concern per commit
- Avoid refactoring while fixing bugs

## Code Style

### TypeScript

- Use strict mode
- Prefer `const` over `let`
- Use explicit return types for public functions
- Avoid `any` - use `unknown` and type guards
- Use ES module imports, never `require()`

### Testing

- Tests live next to source files (`*.test.ts`)
- Use descriptive test names
- One assertion per test when possible
- Test behavior, not implementation
- Import from `bun:test` (not Jest or other frameworks)

## Project-Specific Rules

### Benchmark Tasks

- Tasks are immutable once released
- Changes create new benchmark versions
- Include expected outputs for validation

### Results

- Never modify existing result files
- Results are append-only
- Include metadata (timestamp, version, model config)

### CLI

- Use Ink components for UI
- Keep components small and focused
- Handle errors gracefully with user feedback

## Dependency Management

- Use `bun` exclusively (never npm/yarn/pnpm)
- Minimize dependencies
- Audit before adding new packages
- Prefer built-in Bun APIs

## Common Mistakes to Avoid

### Markdown

- Always add blank lines around headings
- Always add blank lines around lists
- Always specify language for fenced code blocks (use `text` for plain output)

### Imports

- ❌ `const x = require('...')` - Use ES imports instead
- ✅ `import x from '...'`
- ✅ `import { x } from '...'`

### Environment Variables

- Never commit `.env` files
- Always use `.env.example` as template
- Access via `process.env.VAR_NAME`

### Building

- Run `bun run build` to create standalone executable
- The compiled CLI bundles all dependencies (~59MB)
- Test the compiled binary before releasing

### JSON Imports

- TypeScript can import JSON directly: `import data from './file.json'`
- Ensure `resolveJsonModule: true` in tsconfig.json

### React/Ink

- No need for `import React from 'react'` with JSX transform
- Use functional components only
- Props interface should be explicitly typed

## Before Submitting

**IMPORTANT: Always run these checks before committing:**

1. Run `bun run lint:md` - no markdown errors (run this first!)
2. Run `bun test` - all tests pass
3. Run `bun run lint` - no lint errors
4. Run `bun run typecheck` - no type errors
5. Check bundle size hasn't grown unnecessarily
6. Verify no secrets in code
7. Update documentation if behavior changes

The markdown lint check (`bun run lint:md`) must pass before any commit.

## Adding New Models

When adding models to `config/models.json`, refer to the model configuration documentation:

- **[docs/model-configuration.md](docs/model-configuration.md)** - Complete reference for model properties, API support tables, and examples

Key properties to set for each model:

- `supportsResponses` - Whether to use Responses API (OpenAI models) or Chat API
- `supportsTools` - Whether the model supports tool/function calling
- `reasoningModel` - Whether the model uses reasoning tokens

## Documentation

Extended documentation lives in the `docs/` folder:

- `docs/model-configuration.md` - Model setup and API compatibility reference
