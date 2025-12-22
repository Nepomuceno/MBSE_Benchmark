import type { Task } from "../tasks/types.js";
import type { VirtualFileSystem } from "../filesystem/types.js";

export interface EvaluationResult {
  score: number; // 0-1 normalized
  details: {
    matched?: string[];
    missing?: string[];
    criteria?: CriterionScore[];
  };
  explanation?: string;
}

export interface CriterionScore {
  name: string;
  score: number; // 0-1
  feedback: string;
}

export interface EvaluationStrategy {
  type: string;
  evaluate(response: string, task: Task, context?: EvaluationContext): Promise<EvaluationResult>;
}

export interface EvaluationContext {
  fileContents?: Record<string, string>;
  taskPrompt?: string;
  fs?: VirtualFileSystem;
}

export interface LlmJudgeConfig {
  modelId: string;
  temperature: number;
  maxTokens: number;
}

export interface BenchmarkSettings {
  llmJudge: LlmJudgeConfig;
  maxIterations: number;
  timeout: number;
  maxRetries: number;
}
