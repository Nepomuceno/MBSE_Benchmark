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
  /**
   * Perform any optional warmup needed before running benchmarks.
   *
   * This method is called once before benchmark runs so that an implementation
   * can load the underlying model into memory, create caches, or perform other
   * initialization work that would otherwise skew the latency of the first
   * benchmarked request.
   *
   * Failures in this method are treated as non-fatal by the caller: benchmarks
   * should still proceed even if warmup fails.
   */
  warmup(): Promise<void>;
}
