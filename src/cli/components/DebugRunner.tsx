import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import { loadTask, getTaskIds } from "../../tasks/index.js";
import { getModel, createModelClient } from "../../models/index.js";
import { createVirtualFS, createFileSystemTools } from "../../filesystem/index.js";
import { evaluateTask, loadBenchmarkSettings } from "../../evaluation/index.js";
import type { LoadedTask } from "../../tasks/types.js";
import type { ToolCall } from "../../models/types.js";
import type { EvaluationResult } from "../../evaluation/types.js";

interface DebugRunnerProps {
  modelId: string;
  taskId: string;
}

interface IterationResult {
  iteration: number;
  response: string;
  toolCalls?: ToolCall[];
  toolResults?: Array<{ tool: string; result: unknown }>;
  latencyMs: number;
}

type DebugStatus = "loading" | "running" | "evaluating" | "complete" | "error";

interface DebugState {
  status: DebugStatus;
  task?: LoadedTask;
  iterations: IterationResult[];
  currentIteration: number;
  maxIterations: number;
  finalResponse: string;
  filesSnapshot: Record<string, string>;
  evaluation?: EvaluationResult;
  score: number;
  totalLatencyMs: number;
  error?: string;
}

function formatLatency(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatScore(score: number): string {
  return `${(score * 100).toFixed(0)}%`;
}

function getScoreColor(score: number): string {
  if (score >= 0.8) return "green";
  if (score >= 0.5) return "yellow";
  if (score > 0) return "red";
  return "gray";
}

// Spinner animation
const SPINNER = ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"];

function Spinner({ color = "cyan" }: { color?: string }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = globalThis.setInterval(() => setFrame((f) => (f + 1) % SPINNER.length), 80);
    return () => globalThis.clearInterval(t);
  }, []);
  return <Text color={color}>{SPINNER[frame]}</Text>;
}

export function DebugRunner({ modelId, taskId }: DebugRunnerProps) {
  const { exit } = useApp();
  const [state, setState] = useState<DebugState>({
    status: "loading",
    iterations: [],
    currentIteration: 0,
    maxIterations: 10,
    finalResponse: "",
    filesSnapshot: {},
    score: 0,
    totalLatencyMs: 0,
  });

  useEffect(() => {
    async function run() {
      try {
        // Load task
        const task = await loadTask(taskId, ".");
        const settings = loadBenchmarkSettings();
        const maxIterations = settings.maxIterations;

        setState((s) => ({ ...s, task, maxIterations, status: "running" }));

        // Get model
        const modelConfig = getModel(modelId);
        if (!modelConfig) {
          throw new Error(`Model not found: ${modelId}`);
        }
        const adapter = createModelClient(modelConfig);

        // Warmup the model (loads it into memory for local models)
        await adapter.warmup();

        // Create virtual file system
        const fs = createVirtualFS(task.initialFiles);
        const fsTools = createFileSystemTools(fs);

        // Build initial prompt
        let currentPrompt = buildTaskPrompt(task, fsTools.definitions.map((t) => t.name));
        let finalResponse = "";
        const iterations: IterationResult[] = [];
        const startTime = Date.now();

        // Agentic loop
        for (let i = 0; i < maxIterations; i++) {
          setState((s) => ({ ...s, currentIteration: i + 1 }));

          const iterationStart = Date.now();
          const result = await adapter.generate(currentPrompt, {
            maxTokens: task.maxTokens || 2000,
            tools: fsTools.definitions,
          });

          const iteration: IterationResult = {
            iteration: i + 1,
            response: result.text,
            toolCalls: result.toolCalls,
            latencyMs: Date.now() - iterationStart,
          };

          // If no tool calls, we're done
          if (!result.toolCalls || result.toolCalls.length === 0) {
            iterations.push(iteration);
            setState((s) => ({ ...s, iterations: [...s.iterations, iteration] }));
            finalResponse = result.text;
            break;
          }

          // Execute tool calls
          const toolResults: Array<{ tool: string; result: unknown }> = [];
          for (const toolCall of result.toolCalls) {
            const toolResult = await fsTools.execute(toolCall.name, toolCall.arguments);
            toolResults.push({ tool: toolCall.name, result: toolResult });
          }

          iteration.toolResults = toolResults;
          iterations.push(iteration);
          setState((s) => ({ ...s, iterations: [...s.iterations, iteration] }));

          // Build next prompt
          currentPrompt = buildFollowUpPrompt(task, result.text, toolResults);
          finalResponse = result.text;
        }

        const totalLatencyMs = Date.now() - startTime;
        const filesSnapshot = fs.getSnapshot();

        setState((s) => ({
          ...s,
          status: "evaluating",
          finalResponse,
          filesSnapshot,
          totalLatencyMs,
        }));

        // Evaluate
        const evaluation = await evaluateTask(
          finalResponse,
          task,
          {
            fs,
            fileContents: filesSnapshot,
            taskPrompt: task.prompt,
          },
          settings.llmJudge
        );

        setState((s) => ({
          ...s,
          status: "complete",
          evaluation,
          score: evaluation.score,
        }));

        globalThis.setTimeout(() => exit(), 500);
      } catch (err) {
        setState((s) => ({
          ...s,
          status: "error",
          error: err instanceof Error ? err.message : String(err),
        }));
        globalThis.setTimeout(() => exit(), 100);
      }
    }

    run();
  }, [modelId, taskId, exit]);

  if (state.status === "error") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="red">✗ Debug Run Failed</Text>
        <Text color="red">{state.error}</Text>
      </Box>
    );
  }

  if (state.status === "loading") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">🔍 Debug Mode</Text>
        <Text color="cyan">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
        <Box marginTop={1}>
          <Spinner />
          <Text color="yellow"> Loading task...</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Text bold color="cyan">🔍 Debug Mode</Text>
      <Text color="cyan">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>

      {/* Task info */}
      <Box marginTop={1} flexDirection="column">
        <Box>
          <Text bold>Task: </Text>
          <Text color="magenta">{taskId}</Text>
        </Box>
        <Box>
          <Text bold>Model: </Text>
          <Text color="blue">{modelId}</Text>
        </Box>
        {state.task && (
          <Box>
            <Text bold>Name: </Text>
            <Text>{state.task.name}</Text>
          </Box>
        )}
      </Box>

      {/* Status */}
      <Box marginTop={1}>
        {state.status === "running" && (
          <Box>
            <Spinner color="yellow" />
            <Text color="yellow">
              {" "}Running iteration {state.currentIteration}/{state.maxIterations}...
            </Text>
          </Box>
        )}
        {state.status === "evaluating" && (
          <Box>
            <Spinner color="blue" />
            <Text color="blue"> Evaluating results...</Text>
          </Box>
        )}
        {state.status === "complete" && (
          <Text color="green">✓ Complete</Text>
        )}
      </Box>

      {/* Iterations */}
      {state.iterations.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          <Text bold color="gray">─── Iterations ───</Text>
          {state.iterations.map((iter) => (
            <Box key={iter.iteration} flexDirection="column" marginTop={1}>
              <Box>
                <Text bold color="cyan">Iteration {iter.iteration}</Text>
                <Text color="gray"> ({formatLatency(iter.latencyMs)})</Text>
              </Box>

              {/* Tool calls */}
              {iter.toolCalls && iter.toolCalls.length > 0 && (
                <Box flexDirection="column" marginLeft={2}>
                  <Text color="yellow">Tool calls:</Text>
                  {iter.toolCalls.map((tc, idx) => (
                    <Box key={idx} marginLeft={2}>
                      <Text color="green">• {tc.name}</Text>
                      <Text color="gray">
                        ({JSON.stringify(tc.arguments).slice(0, 50)}
                        {JSON.stringify(tc.arguments).length > 50 ? "..." : ""})
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Tool results */}
              {iter.toolResults && iter.toolResults.length > 0 && (
                <Box flexDirection="column" marginLeft={2}>
                  <Text color="blue">Results:</Text>
                  {iter.toolResults.map((tr, idx) => {
                    const resultStr = JSON.stringify(tr.result);
                    const truncated = resultStr.length > 80 ? resultStr.slice(0, 80) + "..." : resultStr;
                    return (
                      <Box key={idx} marginLeft={2}>
                        <Text color="gray">• {tr.tool}: </Text>
                        <Text>{truncated}</Text>
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* Response (truncated) */}
              {!iter.toolCalls?.length && iter.response && (
                <Box marginLeft={2}>
                  <Text color="gray">Response: </Text>
                  <Text>
                    {iter.response.slice(0, 100)}
                    {iter.response.length > 100 ? "..." : ""}
                  </Text>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Files snapshot */}
      {state.status === "complete" && Object.keys(state.filesSnapshot).length > 0 && (
        <Box marginTop={1} flexDirection="column">
          <Text bold color="gray">─── Files ───</Text>
          {Object.entries(state.filesSnapshot).map(([path, content]) => (
            <Box key={path} flexDirection="column" marginTop={1}>
              <Text color="cyan">📄 {path}</Text>
              <Box marginLeft={2}>
                <Text color="gray">
                  {content.split("\n").slice(0, 5).join("\n")}
                  {content.split("\n").length > 5 ? "\n..." : ""}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Evaluation */}
      {state.evaluation && (
        <Box marginTop={1} flexDirection="column">
          <Text bold color="gray">─── Evaluation ───</Text>
          <Box marginTop={1}>
            <Text bold>Score: </Text>
            <Text color={getScoreColor(state.score)} bold>
              {formatScore(state.score)}
            </Text>
          </Box>
          {state.evaluation.explanation && (
            <Box marginTop={1}>
              <Text bold>Explanation: </Text>
              <Text>{state.evaluation.explanation}</Text>
            </Box>
          )}
          {state.evaluation.details && Object.keys(state.evaluation.details).length > 0 && (
            <Box marginTop={1} flexDirection="column">
              <Text bold>Details:</Text>
              {Object.entries(state.evaluation.details).map(([key, value]) => (
                <Box key={key} marginLeft={2}>
                  <Text color="gray">• {key}: </Text>
                  <Text>{JSON.stringify(value)}</Text>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Summary */}
      {state.status === "complete" && (
        <Box marginTop={1} flexDirection="column">
          <Text color="gray">─────────────────────────────────────────────────────</Text>
          <Box>
            <Text>Total iterations: </Text>
            <Text bold>{state.iterations.length}</Text>
            <Text color="gray"> │ </Text>
            <Text>Time: </Text>
            <Text bold>{formatLatency(state.totalLatencyMs)}</Text>
          </Box>
          <Box marginTop={1}>
            <Text color="yellow">💡 Results not saved (debug mode)</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}

function buildTaskPrompt(task: LoadedTask, availableTools: string[]): string {
  let prompt = task.prompt;

  if (task.context) {
    prompt += `\n\nContext:\n${task.context}`;
  }

  if (Object.keys(task.initialFiles).length > 0) {
    prompt += `\n\nYou have access to a file system with the following files:\n`;
    for (const path of Object.keys(task.initialFiles)) {
      prompt += `- ${path}\n`;
    }
  }

  prompt += `\n\nYou can use the following tools: ${availableTools.join(", ")}.`;
  prompt += `\nWhen you are done, provide your final response without any tool calls.`;

  return prompt;
}

function buildFollowUpPrompt(
  task: LoadedTask,
  previousResponse: string,
  toolResults: Array<{ tool: string; result: unknown }>
): string {
  let prompt = `Continue the task: ${task.name}\n\n`;
  prompt += `Your previous response: ${previousResponse}\n\n`;
  prompt += `Tool results:\n`;

  for (const { tool, result } of toolResults) {
    prompt += `- ${tool}: ${JSON.stringify(result)}\n`;
  }

  prompt += `\nContinue with your task. When done, provide your final response without any tool calls.`;

  return prompt;
}

// Task list component for when no task is specified
export function TaskList() {
  const [tasks, setTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTaskIds(".").then((ids) => {
      setTasks(ids);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Spinner />
        <Text color="yellow"> Loading tasks...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">📋 Available Tasks</Text>
      <Text color="cyan">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</Text>
      <Box marginTop={1} flexDirection="column">
        {tasks.map((id) => (
          <Box key={id}>
            <Text color="magenta">• {id}</Text>
          </Box>
        ))}
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text color="gray">─────────────────────────────────────────────────────</Text>
        <Text color="gray">{tasks.length} tasks available</Text>
        <Box marginTop={1}>
          <Text color="yellow">💡 </Text>
          <Text>Run: </Text>
          <Text color="cyan">bun run bench --debug --model {"<id>"} --task {"<task-id>"}</Text>
        </Box>
      </Box>
    </Box>
  );
}
