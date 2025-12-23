import type { Task, TaskValidationResult, TaskType } from "./types.js";

const VALID_TASK_TYPES: TaskType[] = ["qa", "analysis", "generation"];
const VALID_EVALUATION_TYPES = [
  "keyword-match",
  "element-extraction",
  "llm-judge",
  "file-validation",
  "sysml-validation",
];
const VALID_FILE_VALIDATION_TYPES = [
  "exists",
  "exact",
  "contains",
  "regex",
  "json-schema",
  "llm-judge",
];

export function validateTask(task: unknown): TaskValidationResult {
  const errors: string[] = [];

  if (!task || typeof task !== "object") {
    return { valid: false, errors: ["Task must be an object"] };
  }

  const t = task as Record<string, unknown>;

  // Required fields
  if (!t.id || typeof t.id !== "string") {
    errors.push("Task must have a string 'id'");
  }

  if (!t.type || typeof t.type !== "string") {
    errors.push("Task must have a string 'type'");
  } else if (!VALID_TASK_TYPES.includes(t.type as TaskType)) {
    errors.push(`Invalid task type: ${t.type}. Must be one of: ${VALID_TASK_TYPES.join(", ")}`);
  }

  if (!t.name || typeof t.name !== "string") {
    errors.push("Task must have a string 'name'");
  }

  if (!t.description || typeof t.description !== "string") {
    errors.push("Task must have a string 'description'");
  }

  if (!t.prompt || typeof t.prompt !== "string") {
    errors.push("Task must have a string 'prompt'");
  }

  // Evaluation
  if (!t.evaluation || typeof t.evaluation !== "object") {
    errors.push("Task must have an 'evaluation' object");
  } else {
    const evalErrors = validateEvaluation(t.evaluation as Record<string, unknown>);
    errors.push(...evalErrors);
  }

  // Optional files
  if (t.files !== undefined) {
    if (typeof t.files !== "object" || t.files === null) {
      errors.push("'files' must be an object if provided");
    } else {
      const filesErrors = validateFiles(t.files as Record<string, unknown>);
      errors.push(...filesErrors);
    }
  }

  // Optional fields type checks
  if (t.context !== undefined && typeof t.context !== "string") {
    errors.push("'context' must be a string if provided");
  }

  if (t.maxTokens !== undefined && typeof t.maxTokens !== "number") {
    errors.push("'maxTokens' must be a number if provided");
  }

  return { valid: errors.length === 0, errors };
}

function validateEvaluation(evaluation: Record<string, unknown>): string[] {
  const errors: string[] = [];

  if (!evaluation.type || typeof evaluation.type !== "string") {
    errors.push("Evaluation must have a string 'type'");
  } else if (!VALID_EVALUATION_TYPES.includes(evaluation.type)) {
    errors.push(
      `Invalid evaluation type: ${evaluation.type}. Must be one of: ${VALID_EVALUATION_TYPES.join(", ")}`
    );
  }

  if (evaluation.weight === undefined || typeof evaluation.weight !== "number") {
    errors.push("Evaluation must have a number 'weight'");
  }

  return errors;
}

function validateFiles(files: Record<string, unknown>): string[] {
  const errors: string[] = [];

  if (files.initial !== undefined && typeof files.initial !== "string") {
    errors.push("'files.initial' must be a string path if provided");
  }

  if (files.expected !== undefined) {
    if (!Array.isArray(files.expected)) {
      errors.push("'files.expected' must be an array if provided");
    } else {
      for (let i = 0; i < files.expected.length; i++) {
        const exp = files.expected[i] as Record<string, unknown>;
        const expErrors = validateExpectedFile(exp, i);
        errors.push(...expErrors);
      }
    }
  }

  return errors;
}

function validateExpectedFile(
  expected: Record<string, unknown>,
  index: number
): string[] {
  const errors: string[] = [];
  const prefix = `files.expected[${index}]`;

  if (!expected.path || typeof expected.path !== "string") {
    errors.push(`${prefix} must have a string 'path'`);
  }

  if (!expected.validation || typeof expected.validation !== "object") {
    errors.push(`${prefix} must have a 'validation' object`);
  } else {
    const validation = expected.validation as Record<string, unknown>;
    if (!validation.type || typeof validation.type !== "string") {
      errors.push(`${prefix}.validation must have a string 'type'`);
    } else if (!VALID_FILE_VALIDATION_TYPES.includes(validation.type)) {
      errors.push(
        `${prefix}.validation has invalid type: ${validation.type}. Must be one of: ${VALID_FILE_VALIDATION_TYPES.join(", ")}`
      );
    }
  }

  return errors;
}

export function isValidTask(task: unknown): task is Task {
  return validateTask(task).valid;
}
