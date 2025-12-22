import type { LoadedTask } from "../tasks/types.js";
import type { EvaluationResult, BenchmarkSettings } from "../evaluation/types.js";
import type { ModelAdapter, ToolCall } from "../models/types.js";
import { loadTask, loadAllTasks } from "../tasks/index.js";
import { createVirtualFS, createFileSystemTools } from "../filesystem/index.js";
import { getModel, createModelClient } from "../models/index.js";
import {
  evaluateTask,
  computeTaskScore,
  aggregateScores,
  loadBenchmarkSettings,
} from "../evaluation/index.js";
import { computeVersion } from "./version.js";

export interface BenchmarkConfig {
  version?: string;
  tasks?: string[];
  maxIterations?: number;
  basePath?: string;
}

export interface TaskIteration {
  iteration: number;
  response: string;
  toolCalls?: ToolCall[];
  toolResults?: Array<{ tool: string; result: unknown }>;
  latencyMs: number;
}

export interface TaskResult {
  taskId: string;
  score: number;
  iterations: TaskIteration[];
  finalResponse: string;
  evaluation: EvaluationResult;
  filesSnapshot: Record<string, string>;
  latencyMs: number;
  error?: string;
}

export interface BenchmarkResult {
  version: string;
  modelId: string;
  timestamp: string;
  tasks: TaskResult[];
  score: number;
  metadata: {
    duration: number;
    tasksCompleted: number;
    tasksFailed: number;
    totalIterations: number;
  };
}

export async function runBenchmark(
  modelId: string,
  config: BenchmarkConfig = {}
): Promise<BenchmarkResult> {
  const startTime = Date.now();
  const basePath = config.basePath || ".";
  const settings = loadBenchmarkSettings();
  const version = config.version || (await computeVersion(basePath));
  const maxIterations = config.maxIterations || settings.maxIterations;

  // Get model
  const modelConfig = getModel(modelId);
  if (!modelConfig) {
    throw new Error(`Model not found: ${modelId}`);
  }
  const adapter = createModelClient(modelConfig);

  // Load tasks
  let tasks: LoadedTask[];
  if (config.tasks && config.tasks.length > 0) {
    tasks = await Promise.all(config.tasks.map((id) => loadTask(id, basePath)));
  } else {
    tasks = await loadAllTasks(basePath);
  }

  // Run tasks in parallel with concurrency from settings (default 5)
  const concurrency = settings.parallelTasks ?? 5;

  let taskResults: TaskResult[];

  if (tasks.length > 1 && concurrency > 1) {
    // Run tasks in parallel with concurrency limit
    taskResults = await runTasksInParallel(
      tasks,
      adapter,
      maxIterations,
      settings,
      concurrency
    );
  } else {
    // Run tasks sequentially
    taskResults = [];
    for (const task of tasks) {
      const result = await runTask(adapter, task, maxIterations, settings);
      taskResults.push(result);
    }
  }

  const totalIterations = taskResults.reduce(
    (sum, r) => sum + r.iterations.length,
    0
  );

  // Compute aggregate score
  const taskScores = taskResults.map((r) => {
    const task = tasks.find((t) => t.id === r.taskId)!;
    return computeTaskScore(r.taskId, r.evaluation, task);
  });
  const aggregate = aggregateScores(taskScores);

  const duration = Date.now() - startTime;

  return {
    version,
    modelId,
    timestamp: new Date().toISOString(),
    tasks: taskResults,
    score: aggregate.overall,
    metadata: {
      duration,
      tasksCompleted: taskResults.filter((r) => !r.error).length,
      tasksFailed: taskResults.filter((r) => r.error).length,
      totalIterations,
    },
  };
}

async function runTasksInParallel(
  tasks: LoadedTask[],
  adapter: ModelAdapter,
  maxIterations: number,
  settings: BenchmarkSettings,
  concurrency: number
): Promise<TaskResult[]> {
  const results: TaskResult[] = [];
  const queue = [...tasks];

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const task = queue.shift();
      if (task) {
        const result = await runTask(adapter, task, maxIterations, settings);
        results.push(result);
      }
    }
  }

  // Start workers up to concurrency limit
  const workers = Array.from(
    { length: Math.min(concurrency, tasks.length) },
    () => worker()
  );
  await Promise.all(workers);

  // Sort results to match original task order
  const taskOrder = new Map(tasks.map((t, i) => [t.id, i]));
  results.sort((a, b) => (taskOrder.get(a.taskId) ?? 0) - (taskOrder.get(b.taskId) ?? 0));

  return results;
}

async function runTask(
  adapter: ModelAdapter,
  task: LoadedTask,
  maxIterations: number,
  settings: BenchmarkSettings
): Promise<TaskResult> {
  const taskStartTime = Date.now();
  const iterations: TaskIteration[] = [];

  // Create virtual file system with initial files
  const fs = createVirtualFS(task.initialFiles);
  const fsTools = createFileSystemTools(fs);

  // Build the prompt with tool availability info
  let currentPrompt = buildTaskPrompt(task, fsTools.definitions.map((t) => t.name));
  let finalResponse = "";

  try {
    // Agentic loop
    for (let i = 0; i < maxIterations; i++) {
      const iterationStart = Date.now();

      const result = await adapter.generate(currentPrompt, {
        maxTokens: task.maxTokens || 2000,
        temperature: 0,
        tools: fsTools.definitions,
      });

      const iteration: TaskIteration = {
        iteration: i + 1,
        response: result.text,
        toolCalls: result.toolCalls,
        latencyMs: Date.now() - iterationStart,
      };

      // If no tool calls, we're done
      if (!result.toolCalls || result.toolCalls.length === 0) {
        iterations.push(iteration);
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

      // Build next prompt with tool results
      currentPrompt = buildFollowUpPrompt(task, result.text, toolResults);
      finalResponse = result.text;
    }

    // Evaluate the result
    const filesSnapshot = fs.getSnapshot();
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

    return {
      taskId: task.id,
      score: evaluation.score,
      iterations,
      finalResponse,
      evaluation,
      filesSnapshot,
      latencyMs: Date.now() - taskStartTime,
    };
  } catch (error) {
    return {
      taskId: task.id,
      score: 0,
      iterations,
      finalResponse,
      evaluation: {
        score: 0,
        details: {},
        explanation: error instanceof Error ? error.message : String(error),
      },
      filesSnapshot: fs.getSnapshot(),
      latencyMs: Date.now() - taskStartTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
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

export { computeVersion, clearVersionCache } from "./version.js";
