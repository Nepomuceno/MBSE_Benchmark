import type { Task } from "../tasks/types.js";
import type {
  EvaluationStrategy,
  EvaluationResult,
  EvaluationContext,
  LlmJudgeConfig,
  BenchmarkSettings,
} from "./types.js";
import { createKeywordMatchStrategy } from "./strategies/keyword-match.js";
import { createLlmJudgeStrategy } from "./strategies/llm-judge.js";
import { createFileValidationStrategy } from "./strategies/file-validation.js";
import benchmarkConfig from "../../config/benchmark.json";

export function loadBenchmarkSettings(): BenchmarkSettings {
  return benchmarkConfig as BenchmarkSettings;
}

export function createEvaluationStrategy(
  type: string,
  llmJudgeConfig?: LlmJudgeConfig
): EvaluationStrategy {
  switch (type) {
    case "keyword-match":
      return createKeywordMatchStrategy();
    case "llm-judge":
      if (!llmJudgeConfig) {
        throw new Error("LLM judge config required for llm-judge strategy");
      }
      return createLlmJudgeStrategy(llmJudgeConfig);
    case "file-validation":
      return createFileValidationStrategy(llmJudgeConfig);
    case "element-extraction":
      // Fall back to keyword match for now
      return createKeywordMatchStrategy();
    default:
      throw new Error(`Unknown evaluation strategy: ${type}`);
  }
}

export async function evaluateTask(
  response: string,
  task: Task,
  context?: EvaluationContext,
  llmJudgeConfig?: LlmJudgeConfig
): Promise<EvaluationResult> {
  const strategy = createEvaluationStrategy(task.evaluation.type, llmJudgeConfig);
  return strategy.evaluate(response, task, context);
}

export { computeTaskScore, aggregateScores } from "./scorer.js";
export type {
  EvaluationStrategy,
  EvaluationResult,
  EvaluationContext,
  LlmJudgeConfig,
  BenchmarkSettings,
  CriterionScore,
} from "./types.js";
export type { TaskScore, AggregateScore } from "./scorer.js";
