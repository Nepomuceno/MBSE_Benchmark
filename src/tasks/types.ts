export type TaskType = "qa" | "analysis" | "generation";

export type ValidationRuleType =
  | "exists"
  | "exact"
  | "contains"
  | "regex"
  | "json-schema"
  | "llm-judge";

export interface ExistsValidation {
  type: "exists";
  value: boolean;
}

export interface ExactValidation {
  type: "exact";
  content: string;
}

export interface ContainsValidation {
  type: "contains";
  substrings: string[];
  all?: boolean; // default true - must contain all
}

export interface RegexValidation {
  type: "regex";
  patterns: string[];
  all?: boolean; // default true - must match all
}

export interface JsonSchemaValidation {
  type: "json-schema";
  schema: Record<string, unknown>;
}

export interface LlmJudgeValidation {
  type: "llm-judge";
  criteria: string[];
  minScore?: number; // 0-1, default 0.7
}

export type FileValidation =
  | ExistsValidation
  | ExactValidation
  | ContainsValidation
  | RegexValidation
  | JsonSchemaValidation
  | LlmJudgeValidation;

export interface ExpectedFile {
  path: string;
  validation: FileValidation;
}

export interface TaskFiles {
  /** Path to initial files directory relative to task directory */
  initial?: string;
  /** Expected files after task completion */
  expected?: ExpectedFile[];
}

export interface TaskEvaluation {
  type: "keyword-match" | "element-extraction" | "llm-judge" | "file-validation";
  weight: number;
  keywords?: string[];
  elements?: string[];
  criteria?: string[];
}

export interface Task {
  id: string;
  type: TaskType;
  name: string;
  description: string;
  prompt: string;
  context?: string;
  maxTokens?: number;
  files?: TaskFiles;
  evaluation: TaskEvaluation;
}

export interface TaskIndex {
  version: string;
  tasks: string[];
}

export interface LoadedTask extends Task {
  /** Initial files loaded into memory (path -> content) */
  initialFiles: Record<string, string>;
}

export interface TaskValidationResult {
  valid: boolean;
  errors: string[];
}
