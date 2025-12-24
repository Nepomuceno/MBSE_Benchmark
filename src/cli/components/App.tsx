import React from "react";
import { Box, Text } from "ink";
import type { CliArgs } from "../args";
import { ResultsView } from "./ResultsView";
import { BenchmarkRunner } from "./BenchmarkRunner";
import { AllModelsRunner } from "./AllModelsRunner";
import { DebugRunner, TaskList } from "./DebugRunner";
import { loadModels } from "../../models/index.js";

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

  if (args.debug) {
    if (!args.model) {
      return (
        <Box flexDirection="column" padding={1}>
          <Text bold color="red">✗ Debug mode requires --model</Text>
          <Text>Usage: bun run bench --debug --model {"<id>"} --task {"<task-id>"}</Text>
        </Box>
      );
    }
    if (!args.task) {
      return (
        <Box flexDirection="column" padding={1}>
          <Text bold color="red">✗ Debug mode requires --task</Text>
          <Text>Usage: bun run bench --debug --model {"<id>"} --task {"<task-id>"}</Text>
          <Box marginTop={1}>
            <TaskList />
          </Box>
        </Box>
      );
    }
    return <DebugRunner modelId={args.model} taskId={args.task} />;
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
    return <AllModelsRunner force={args.force} />;
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
        <Text> -d, --debug            Debug mode: run single task with detailed output</Text>
        <Text> -t, --task {"<id>"}      Task to run (used with --debug)</Text>
        <Text> -v, --verbose          Show detailed output</Text>
        <Text> -o, --output {"<fmt>"}   Output format: table, json, minimal</Text>
        <Text> -h, --help             Show this help</Text>
        <Text />
        <Text bold>Debug Mode:</Text>
        <Text>  bun run bench --debug --model {"<model-id>"} --task {"<task-id>"}</Text>
        <Text dimColor>  Runs a single task and shows detailed execution info</Text>
      </Box>
    </Box>
  );
}

function ListView() {
  const models = loadModels();
  
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">📋 Available Models</Text>
      <Text color="cyan">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
      
      <Box marginTop={1} flexDirection="column">
        {/* Header */}
        <Box>
          <Box width={22}><Text bold color="gray">ID</Text></Box>
          <Box width={28}><Text bold color="gray">Name</Text></Box>
          <Box width={18}><Text bold color="gray">Provider</Text></Box>
          <Box width={10}><Text bold color="gray">Status</Text></Box>
        </Box>
        <Text color="gray">─────────────────────────────────────────────────────────────────────────</Text>
        
        {models.map((model) => {
          // Local models don't require API keys
          const isLocal = model.provider === "openai-compatible";
          const hasEndpoint = isLocal 
            ? !!process.env[model.envEndpoint ?? ""] 
            : (!model.envEndpoint || !!process.env[model.envEndpoint]);
          const hasKey = isLocal || !!process.env[model.envKey];
          const isConfigured = isLocal ? hasEndpoint : (hasKey && hasEndpoint);
          
          return (
            <Box key={model.id}>
              <Box width={22}>
                <Text color="magenta">{model.id}</Text>
              </Box>
              <Box width={28}>
                <Text>{model.name}</Text>
              </Box>
              <Box width={18}>
                <Text color="gray">{model.provider}</Text>
              </Box>
              <Box width={10}>
                {isLocal ? (
                  hasEndpoint ? (
                    <Text color="green">✓ Ready</Text>
                  ) : (
                    <Text color="blue">◐ Local</Text>
                  )
                ) : isConfigured ? (
                  <Text color="green">✓ Ready</Text>
                ) : (
                  <Text color="yellow">○ No key</Text>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
      
      <Box marginTop={1} flexDirection="column">
        <Text color="gray">─────────────────────────────────────────────────────────────────────────</Text>
        <Text color="gray">{models.length} models configured</Text>
        <Box marginTop={1}>
          <Text color="yellow">💡 </Text>
          <Text>Run: </Text>
          <Text color="cyan">bun run bench --model {"<id>"}</Text>
        </Box>
      </Box>
    </Box>
  );
}
