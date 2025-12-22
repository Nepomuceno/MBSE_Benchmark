export interface BenchmarkResult {
  version: string;
  modelId: string;
  timestamp: string;
  tasks: TaskResult[];
  score: number;
}

export interface TaskResult {
  taskId: string;
  score: number;
  response: string;
  latencyMs: number;
}

export interface BenchmarkConfig {
  version: string;
  tasks: string[];
}

export async function runBenchmark(
  _modelId: string,
  _config: BenchmarkConfig
): Promise<BenchmarkResult> {
  // TODO: Implement benchmark runner
  throw new Error("Not implemented");
}

export function computeVersion(_tasksDir: string): string {
  // TODO: Compute version hash from tasks, tools, and dataset
  return "0.1.0";
}
