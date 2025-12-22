import modelsConfig from "../../config/models.json";

export interface ModelConfig {
  id: string;
  name: string;
  provider: "azure" | "openai" | "openai-compatible";
  envKey: string;
  envEndpoint?: string;
  deployment?: string;
  model?: string;
}

export function loadModels(): ModelConfig[] {
  return modelsConfig.models as ModelConfig[];
}

export function getModel(id: string): ModelConfig | undefined {
  return loadModels().find((m) => m.id === id);
}
