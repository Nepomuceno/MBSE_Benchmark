import type { Task, ExpectedFile } from "../../tasks/types.js";
import type {
  EvaluationResult,
  EvaluationStrategy,
  EvaluationContext,
  LlmJudgeConfig,
} from "../types.js";
import type { VirtualFileSystem } from "../../filesystem/types.js";
import { validateExpectedFiles } from "../../tasks/validation/file-validator.js";
import { createLlmJudgeStrategy } from "./llm-judge.js";

export class FileValidationStrategy implements EvaluationStrategy {
  type = "file-validation";
  private llmJudgeConfig?: LlmJudgeConfig;

  constructor(llmJudgeConfig?: LlmJudgeConfig) {
    this.llmJudgeConfig = llmJudgeConfig;
  }

  async evaluate(
    _response: string,
    task: Task,
    context?: EvaluationContext
  ): Promise<EvaluationResult> {
    if (!context?.fs) {
      return {
        score: 0,
        details: {},
        explanation: "No file system context provided",
      };
    }

    const expectedFiles = task.files?.expected || [];
    if (expectedFiles.length === 0) {
      return {
        score: 1,
        details: { matched: [], missing: [] },
        explanation: "No expected files to validate",
      };
    }

    // Separate LLM judge validations from others
    const llmJudgeFiles = expectedFiles.filter((f) => f.validation.type === "llm-judge");
    const otherFiles = expectedFiles.filter((f) => f.validation.type !== "llm-judge");

    // Validate non-LLM files
    const otherResults = validateExpectedFiles(otherFiles, { fs: context.fs });

    // Validate LLM judge files
    const llmResults = await this.validateLlmJudgeFiles(
      llmJudgeFiles,
      context.fs,
      task,
      context
    );

    // Combine results
    const allResults = [...otherResults, ...llmResults];
    const passed = allResults.filter((r) => r.passed);
    const failed = allResults.filter((r) => !r.passed);

    const score = allResults.length > 0 ? passed.length / allResults.length : 1;

    return {
      score,
      details: {
        matched: passed.map((r) => r.path),
        missing: failed.map((r) => `${r.path}: ${r.message}`),
      },
      explanation:
        failed.length === 0
          ? "All file validations passed"
          : `${passed.length}/${allResults.length} validations passed`,
    };
  }

  private async validateLlmJudgeFiles(
    files: ExpectedFile[],
    fs: VirtualFileSystem,
    task: Task,
    context?: EvaluationContext
  ): Promise<Array<{ path: string; passed: boolean; message: string }>> {
    if (!this.llmJudgeConfig) {
      return files.map((f) => ({
        path: f.path,
        passed: false,
        message: "LLM judge not configured",
      }));
    }

    if (files.length === 0) {
      return [];
    }

    const results: Array<{ path: string; passed: boolean; message: string }> = [];

    for (const file of files) {
      if (!fs.exists(file.path)) {
        results.push({
          path: file.path,
          passed: false,
          message: "File not found",
        });
        continue;
      }

      const content = fs.readFile(file.path);
      const validation = file.validation;

      if (validation.type !== "llm-judge") {
        continue;
      }

      const criteria = validation.criteria || ["quality"];
      const minScore = validation.minScore ?? 0.7;

      // Create a temporary task for LLM judge
      const judgeTask: Task = {
        ...task,
        evaluation: {
          type: "llm-judge",
          weight: 1,
          criteria,
        },
      };

      const llmJudge = createLlmJudgeStrategy(this.llmJudgeConfig);
      const judgeResult = await llmJudge.evaluate(content, judgeTask, {
        ...context,
        fileContents: { [file.path]: content },
      });

      const passed = judgeResult.score >= minScore;
      results.push({
        path: file.path,
        passed,
        message: passed
          ? `Score ${judgeResult.score.toFixed(2)} >= ${minScore}`
          : `Score ${judgeResult.score.toFixed(2)} < ${minScore}: ${judgeResult.explanation}`,
      });
    }

    return results;
  }
}

export function createFileValidationStrategy(
  llmJudgeConfig?: LlmJudgeConfig
): EvaluationStrategy {
  return new FileValidationStrategy(llmJudgeConfig);
}
