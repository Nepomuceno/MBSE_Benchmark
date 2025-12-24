import { describe, test, expect } from "bun:test";
import type {
  ModelAdapter,
  GenerateOptions,
  GenerateResult,
  ToolDefinition,
} from "./types.js";

describe("types", () => {
  test("ModelAdapter interface has required properties", () => {
    const mockAdapter: ModelAdapter = {
      id: "test-id",
      name: "Test Model",
      warmup: async () => {},
      generate: async () => ({
        text: "response",
        usage: { promptTokens: 10, completionTokens: 20 },
        latencyMs: 100,
      }),
    };

    expect(mockAdapter.id).toBe("test-id");
    expect(mockAdapter.name).toBe("Test Model");
    expect(typeof mockAdapter.generate).toBe("function");
    expect(typeof mockAdapter.warmup).toBe("function");
  });

  test("GenerateResult can include tool calls", async () => {
    const mockAdapter: ModelAdapter = {
      id: "test",
      name: "Test",
      warmup: async () => {},
      generate: async (): Promise<GenerateResult> => ({
        text: "",
        toolCalls: [
          {
            id: "call_123",
            name: "get_weather",
            arguments: { location: "Seattle" },
          },
        ],
        usage: { promptTokens: 10, completionTokens: 20 },
        latencyMs: 100,
      }),
    };

    const result = await mockAdapter.generate("What's the weather?");
    expect(result.toolCalls).toBeDefined();
    expect(result.toolCalls?.length).toBe(1);
    expect(result.toolCalls![0]!.name).toBe("get_weather");
  });

  test("GenerateOptions can specify tools", () => {
    const tools: ToolDefinition[] = [
      {
        name: "get_weather",
        description: "Get current weather for a location",
        parameters: {
          location: { type: "string", description: "City name" },
        },
      },
    ];

    const options: GenerateOptions = {
      maxTokens: 1000,
      systemPrompt: "You are a helpful assistant",
      tools,
    };

    expect(options.tools?.length).toBe(1);
    expect(options.tools![0]!.name).toBe("get_weather");
  });
});
