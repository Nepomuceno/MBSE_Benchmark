# MBSE Benchmark

A benchmarking framework for evaluating AI models on Model-Based Systems Engineering tasks, with a focus on SysML v2.

## Overview

This tool provides a standardized way to benchmark AI models against a curated set of MBSE tasks, with caching, versioning, and beautiful CLI output.

## Features

- 🚀 **Bun-powered** - Fast execution with Bun runtime
- 🤖 **Multi-model support** - Test any AI model via AI SDK (Azure, OpenAI, local models)
- 📊 **Versioned benchmarks** - Track changes to tasks, tools, and datasets
- 💾 **Result caching** - Skip already-run benchmarks unless forced
- 🎨 **Beautiful CLI** - Ink-powered terminal interface
- 📈 **GitHub Actions** - Automated benchmark runs with published rankings
- 🔧 **SysML v2 Validators** - Built-in syntax validation and component extraction

## SysML v2 Tasks

The benchmark currently includes SysML v2 tasks for:

- **Validation** (e.g., `sysml-valid-detection-001`): Syntax validation, error detection
- **Extraction** (e.g., `sysml-extract-parts-001`): Part, port, requirement, connection extraction

Additional categories such as analysis, generation, and transformation are planned for future releases.

### Source Models

The SysML v2 models in `data/tasks/models/source/` are from the
[GfSE SysML-v2-Models](https://github.com/GfSE/SysML-v2-Models) repository
(BSD-3-Clause license).

## Installation

### From Release (Recommended)

Download the pre-built binary for your platform from the [Releases](https://github.com/Nepomuceno/mbse_benchmark/releases) page:

- `mbse-bench-linux-x64` - Linux (x64)
- `mbse-bench-linux-arm64` - Linux (ARM64)
- `mbse-bench-darwin-x64` - macOS (Intel)
- `mbse-bench-darwin-arm64` - macOS (Apple Silicon)
- `mbse-bench-windows-x64.exe` - Windows (x64)

### From Source

```bash
bun install
```

### Build Standalone Binary

```bash
bun run build
./dist/mbse-bench --help
```

## Usage

```bash
# Run benchmark for a specific model
bun run bench --model gpt-4

# Run all configured models
bun run bench --all

# Force re-run (ignore cache)
bun run bench --model gpt-4 --force

# List available models
bun run bench --list
```

## Configuration

### Models (`config/models.json`)

Define your AI models with their specifications and credentials:

```json
{
  "models": [
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "provider": "azure",
      "envKey": "AZURE_OPENAI_API_KEY"
    }
  ]
}
```

### Environment Variables

Set credentials for your AI providers:

```bash
# Azure AI Foundry
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com

# OpenAI
OPENAI_API_KEY=your-key

# Local models (Ollama, etc.)
LOCAL_MODEL_URL=http://localhost:11434
```

## Project Structure

```text
├── src/
│   ├── cli/              # Ink CLI components
│   ├── benchmark/        # Benchmark runner logic
│   ├── evaluation/       # Evaluation strategies
│   │   ├── validators/   # SysML v2 validators
│   │   └── strategies/   # Scoring strategies
│   ├── models/           # AI model adapters
│   ├── cache/            # Result caching
│   └── utils/            # Shared utilities
├── data/
│   ├── tasks/            # Benchmark tasks
│   │   ├── models/       # Source SysML models (from GfSE)
│   │   │   ├── source/   # Valid models
│   │   │   └── invalid/  # Intentionally invalid models
│   │   └── sysml-*/      # Individual task definitions
│   └── results/          # Cached results
├── config/
│   └── models.json       # Model configurations
└── .plan/                # Implementation plans and progress
```

## Benchmark Versioning

The benchmark version is computed from:

- Task definitions
- Available tools
- Evaluation criteria
- Base dataset

Any change to these creates a new version, ensuring result comparability.

## Results

Results are stored in `data/results/` with the structure:

```text
data/results/
├── v1.0.0/
│   ├── gpt-4.json
│   └── claude-3.json
└── v1.1.0/
    └── gpt-4.json
```

## License

MIT License - Gabriel Nepomuceno

## Contributing

See [AGENTS.md](./AGENTS.md) for AI agent contribution guidelines.
