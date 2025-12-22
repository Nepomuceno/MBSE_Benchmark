import React from "react";
import { Box, Text } from "ink";
import type { CliArgs } from "../args";
import { ResultsView } from "./ResultsView";
import { BenchmarkRunner } from "./BenchmarkRunner";

interface AppProps {
  args: CliArgs;
}

export function App({ args }: AppProps) {
  if (args.help) {
    return <HelpView />;
  }

  if (args.list) {
    return <ListView />;
  }

  if (args.results) {
    return <ResultsView modelId={args.resultsModel} />;
  }

  if (args.model) {
    return (
      <BenchmarkRunner
        modelId={args.model}
        force={args.force}
        verbose={args.verbose}
      />
    );
  }

  if (args.all) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">
          🚀 MBSE Benchmark
        </Text>
        <Text dimColor>─────────────────────────</Text>
        <Box marginTop={1}>
          <Text color="yellow">Running all models is not yet implemented.</Text>
        </Box>
        <Text>Use --model {"<id>"} to run a specific model.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        🚀 MBSE Benchmark
      </Text>
      <Text dimColor>─────────────────────────</Text>
      <Box marginTop={1}>
        <Text>No model specified. Use --model {"<id>"} or --all</Text>
      </Box>
    </Box>
  );
}

function HelpView() {
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        MBSE Benchmark CLI
      </Text>
      <Text dimColor>─────────────────────────</Text>
      <Box flexDirection="column" marginTop={1}>
        <Text>
          <Text bold>Usage:</Text> bun run bench [options]
        </Text>
        <Text />
        <Text bold>Options:</Text>
        <Text> -m, --model {"<id>"}    Run benchmark for specific model</Text>
        <Text> -a, --all              Run all configured models</Text>
        <Text> -f, --force            Ignore cached results</Text>
        <Text> -l, --list             List available models</Text>
        <Text> -r, --results [id]     View results (optionally for specific model)</Text>
        <Text> -v, --verbose          Show detailed output</Text>
        <Text> -o, --output {"<fmt>"}   Output format: table, json, minimal</Text>
        <Text> -h, --help             Show this help</Text>
      </Box>
    </Box>
  );
}

function ListView() {
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        Available Models
      </Text>
      <Text dimColor>─────────────────────────</Text>
      <Text color="gray">(Load from config/models.json)</Text>
    </Box>
  );
}
