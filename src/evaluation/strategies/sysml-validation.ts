/**
 * SysML Validation Evaluation Strategy
 *
 * Evaluates LLM responses for SysML v2 syntax validity and structure correctness.
 */

import type { Task } from "../../tasks/types.js";
import type { EvaluationResult, EvaluationStrategy, EvaluationContext } from "../types.js";
import { validateSysmlSyntax } from "../validators/sysml-syntax.js";
import { extractSysmlComponents, compareExtracted, type ExtractedModel } from "../validators/sysml-extractor.js";
import { compareStructures } from "../validators/sysml-structure.js";

export interface SysmlValidationConfig {
  checkSyntax?: boolean;
  checkStructure?: boolean;
  checkElements?: boolean;
  expectedModel?: string;
  expectedElements?: Partial<ExtractedModel>;
  syntaxWeight?: number;
  structureWeight?: number;
  elementsWeight?: number;
}

export class SysmlValidationStrategy implements EvaluationStrategy {
  type = "sysml-validation";

  async evaluate(
    response: string,
    task: Task,
    context?: EvaluationContext
  ): Promise<EvaluationResult> {
    const config = this.getConfig(task, context);

    const scores: { name: string; score: number; weight: number; feedback: string }[] = [];

    // Syntax validation
    if (config.checkSyntax) {
      const syntaxResult = validateSysmlSyntax(response);
      const syntaxScore = syntaxResult.valid ? 1 : 0;
      const errorCount = syntaxResult.errors.length;
      const warningCount = syntaxResult.warnings.length;

      scores.push({
        name: "syntax",
        score: syntaxScore,
        weight: config.syntaxWeight ?? 1,
        feedback: syntaxResult.valid
          ? `Valid SysML v2 syntax (${warningCount} warnings)`
          : `Invalid syntax: ${errorCount} errors, ${warningCount} warnings`,
      });
    }

    // Structure comparison
    if (config.checkStructure && config.expectedModel) {
      const structureResult = compareStructures(config.expectedModel, response);

      scores.push({
        name: "structure",
        score: structureResult.score,
        weight: config.structureWeight ?? 1,
        feedback: structureResult.match
          ? "Structure matches expected model"
          : `Structure differs: ${structureResult.missing.length} missing, ${structureResult.extra.length} extra, ${structureResult.misplaced.length} misplaced`,
      });
    }

    // Element extraction comparison
    if (config.checkElements && config.expectedElements) {
      const actualElements = extractSysmlComponents(response);
      const expectedElements = this.buildExpectedModel(config.expectedElements);
      const comparisonResult = compareExtracted(expectedElements, actualElements);

      scores.push({
        name: "elements",
        score: comparisonResult.matchRatio,
        weight: config.elementsWeight ?? 1,
        feedback:
          comparisonResult.matchRatio === 1
            ? "All expected elements found"
            : `Elements: ${comparisonResult.matched.length} matched, ${comparisonResult.missing.length} missing`,
      });
    }

    // Calculate weighted average - return 1.0 if no checks configured
    let overallScore: number;
    if (scores.length === 0) {
      overallScore = 1;
    } else {
      const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
      const weightedSum = scores.reduce((sum, s) => sum + s.score * s.weight, 0);
      overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
    }

    return {
      score: overallScore,
      details: {
        criteria: scores.map((s) => ({
          name: s.name,
          score: s.score,
          feedback: s.feedback,
        })),
      },
      explanation: this.buildExplanation(scores, overallScore),
    };
  }

  private getConfig(task: Task, context?: EvaluationContext): SysmlValidationConfig {
    const evalConfig = task.evaluation;

    return {
      checkSyntax: evalConfig.checkSyntax ?? true,
      checkStructure: evalConfig.checkStructure ?? false,
      checkElements: evalConfig.checkElements ?? false,
      expectedModel: evalConfig.expectedModel ?? context?.fileContents?.["expected.sysml"],
      expectedElements: evalConfig.expectedElements as Partial<ExtractedModel> | undefined,
      syntaxWeight: evalConfig.syntaxWeight ?? 1,
      structureWeight: evalConfig.structureWeight ?? 1,
      elementsWeight: evalConfig.elementsWeight ?? 1,
    };
  }

  private buildExpectedModel(partial: Partial<ExtractedModel>): ExtractedModel {
    return {
      packages: partial.packages ?? [],
      partDefs: partial.partDefs ?? [],
      parts: partial.parts ?? [],
      portDefs: partial.portDefs ?? [],
      ports: partial.ports ?? [],
      attributes: partial.attributes ?? [],
      connections: partial.connections ?? [],
      requirements: partial.requirements ?? [],
      states: partial.states ?? [],
      transitions: partial.transitions ?? [],
      actions: partial.actions ?? [],
    };
  }

  private buildExplanation(
    scores: { name: string; score: number; feedback: string }[],
    overall: number
  ): string {
    const parts = scores.map((s) => `${s.name}: ${(s.score * 100).toFixed(0)}%`);
    return `SysML validation: ${(overall * 100).toFixed(0)}% (${parts.join(", ")})`;
  }
}

export function createSysmlValidationStrategy(): EvaluationStrategy {
  return new SysmlValidationStrategy();
}
