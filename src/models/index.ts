import modelsConfig from "../../config/models.json";
import { createAzureAdapter, createLocalAdapter } from "./adapters/index.js";
import type { ModelAdapter } from "./types.js";

export interface ModelConfig {
  id: string;
  name: string;
  provider: "azure" | "openai" | "openai-compatible";
  envKey: string;
  envEndpoint?: string;
  deployment?: string;
  model?: string;
  reasoningModel?: boolean;
  /** Whether this model supports the Azure Responses API (vs Chat Completions API) */
  supportsResponses?: boolean;
  /** Whether this model supports tool/function calling */
  supportsTools?: boolean;
}

export function loadModels(): ModelConfig[] {
  return modelsConfig.models as ModelConfig[];
}

export function getModel(id: string): ModelConfig | undefined {
  return loadModels().find((m) => m.id === id);
}

export function createModelClient(config: ModelConfig): ModelAdapter {
  switch (config.provider) {
    case "azure":
      return createAzureAdapter(config);
    case "openai-compatible":
      return createLocalAdapter(config);
    case "openai":
      throw new Error("OpenAI adapter not yet implemented");
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

export type { ModelAdapter, GenerateOptions, GenerateResult, ToolDefinition, ToolCall } from "./types.js";
