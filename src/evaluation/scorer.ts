import type { Task } from "../tasks/types.js";
import type { EvaluationResult } from "./types.js";

export interface TaskScore {
  taskId: string;
  rawScore: number;
  weight: number;
  weightedScore: number;
  evaluation: EvaluationResult;
}

export interface AggregateScore {
  overall: number;
  tasks: TaskScore[];
  totalWeight: number;
}

export function computeTaskScore(
  taskId: string,
  evaluation: EvaluationResult,
  task: Task
): TaskScore {
  const weight = task.evaluation.weight;
  const rawScore = evaluation.score;
  const weightedScore = rawScore * weight;

  return {
    taskId,
    rawScore,
    weight,
    weightedScore,
    evaluation,
  };
}

export function aggregateScores(taskScores: TaskScore[]): AggregateScore {
  const totalWeight = taskScores.reduce((sum, t) => sum + t.weight, 0);
  const totalWeightedScore = taskScores.reduce((sum, t) => sum + t.weightedScore, 0);

  const overall = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

  return {
    overall,
    tasks: taskScores,
    totalWeight,
  };
}
