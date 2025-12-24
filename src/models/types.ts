export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface GenerateOptions {
  maxTokens?: number;
  systemPrompt?: string;
  tools?: ToolDefinition[];
}

export interface GenerateResult {
  text: string;
  toolCalls?: ToolCall[];
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
  latencyMs: number;
}

export interface ModelAdapter {
  id: string;
  name: string;
  generate(prompt: string, options?: GenerateOptions): Promise<GenerateResult>;
  /** Warmup the model with a simple request to load it into memory */
  warmup(): Promise<void>;
}
