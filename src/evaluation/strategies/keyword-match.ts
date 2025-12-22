import type { Task } from "../../tasks/types.js";
import type { EvaluationResult, EvaluationStrategy } from "../types.js";

export class KeywordMatchStrategy implements EvaluationStrategy {
  type = "keyword-match";

  async evaluate(response: string, task: Task): Promise<EvaluationResult> {
    const keywords = task.evaluation.keywords || [];
    if (keywords.length === 0) {
      return {
        score: 1,
        details: { matched: [], missing: [] },
        explanation: "No keywords to match",
      };
    }

    const lowerResponse = response.toLowerCase();
    const matched: string[] = [];
    const missing: string[] = [];

    for (const keyword of keywords) {
      if (lowerResponse.includes(keyword.toLowerCase())) {
        matched.push(keyword);
      } else {
        missing.push(keyword);
      }
    }

    const score = matched.length / keywords.length;

    return {
      score,
      details: { matched, missing },
      explanation:
        score === 1
          ? "All keywords found"
          : `Found ${matched.length}/${keywords.length} keywords`,
    };
  }
}

export function createKeywordMatchStrategy(): EvaluationStrategy {
  return new KeywordMatchStrategy();
}
