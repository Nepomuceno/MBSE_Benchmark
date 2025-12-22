import type { Task } from "../../tasks/types.js";
import type {
  EvaluationResult,
  EvaluationStrategy,
  EvaluationContext,
  LlmJudgeConfig,
  CriterionScore,
} from "../types.js";
import { getModel, createModelClient } from "../../models/index.js";

export class LlmJudgeStrategy implements EvaluationStrategy {
  type = "llm-judge";
  private config: LlmJudgeConfig;

  constructor(config: LlmJudgeConfig) {
    this.config = config;
  }

  async evaluate(
    response: string,
    task: Task,
    context?: EvaluationContext
  ): Promise<EvaluationResult> {
    const criteria = task.evaluation.criteria || ["accuracy", "completeness", "clarity"];

    const modelConfig = getModel(this.config.modelId);
    if (!modelConfig) {
      return {
        score: 0,
        details: { criteria: [] },
        explanation: `LLM judge model not found: ${this.config.modelId}`,
      };
    }

    const adapter = createModelClient(modelConfig);

    const prompt = this.buildPrompt(response, task, criteria, context);

    try {
      const result = await adapter.generate(prompt, {
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
        systemPrompt: "You are an expert evaluator for AI benchmark tasks. Return valid JSON only.",
      });

      const parsed = this.parseResponse(result.text, criteria);
      return parsed;
    } catch (error) {
      return {
        score: 0,
        details: { criteria: [] },
        explanation: `LLM judge failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  private buildPrompt(
    response: string,
    task: Task,
    criteria: string[],
    context?: EvaluationContext
  ): string {
    let prompt = `You are evaluating an AI response for a benchmark task.

## Task Information
- **Name**: ${task.name}
- **Description**: ${task.description}
- **Prompt given to AI**: ${task.prompt}
`;

    if (context?.fileContents && Object.keys(context.fileContents).length > 0) {
      prompt += `\n## Files Created/Modified by AI\n`;
      for (const [path, content] of Object.entries(context.fileContents)) {
        prompt += `\n### ${path}\n\`\`\`\n${content}\n\`\`\`\n`;
      }
    }

    prompt += `\n## AI Response\n${response}\n`;

    prompt += `\n## Evaluation Criteria
Score each criterion from 0.0 to 1.0:
${criteria.map((c) => `- **${c}**`).join("\n")}

## Response Format
Return ONLY valid JSON in this exact format:
{
  "scores": {
${criteria.map((c) => `    "${c}": <score 0.0-1.0>`).join(",\n")}
  },
  "feedback": {
${criteria.map((c) => `    "${c}": "<brief feedback>"`).join(",\n")}
  },
  "overall": "<overall assessment>"
}`;

    return prompt;
  }

  private parseResponse(text: string, criteria: string[]): EvaluationResult {
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = text;
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1]!;
      }

      const parsed = JSON.parse(jsonStr.trim()) as {
        scores: Record<string, number>;
        feedback: Record<string, string>;
        overall?: string;
      };

      const criteriaScores: CriterionScore[] = criteria.map((c) => ({
        name: c,
        score: Math.max(0, Math.min(1, parsed.scores[c] ?? 0)),
        feedback: parsed.feedback[c] ?? "",
      }));

      if (criteriaScores.length === 0) {
        return {
          score: 0,
          details: { criteria: criteriaScores },
          explanation: parsed.overall,
        };
      }

      const avgScore =
        criteriaScores.reduce((sum, c) => sum + c.score, 0) / criteriaScores.length;

      return {
        score: avgScore,
        details: { criteria: criteriaScores },
        explanation: parsed.overall,
      };
    } catch {
      // If parsing fails, try to extract a score from the text
      const scoreMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:\/\s*(?:1|10|100))?/);
      let score = 0;
      if (scoreMatch) {
        const rawScore = parseFloat(scoreMatch[1]!);
        const matchedText = scoreMatch[0];
        let divisor = 1;
        if (matchedText.includes("/10")) {
          divisor = 10;
        } else if (matchedText.includes("/100")) {
          divisor = 100;
        }
        // If "/" is present, divide; otherwise treat rawScore as already in [0,1] scale
        score = matchedText.includes("/") ? rawScore / divisor : rawScore;
      }

      return {
        score: Math.max(0, Math.min(1, score)),
        details: { criteria: [] },
        explanation: `Failed to parse structured response. Raw: ${text.slice(0, 200)}`,
      };
    }
  }
}

export function createLlmJudgeStrategy(config: LlmJudgeConfig): EvaluationStrategy {
  return new LlmJudgeStrategy(config);
}
