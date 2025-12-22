import { createAzure } from "@ai-sdk/azure";
import { generateText, tool, jsonSchema } from "ai";
import type { JSONSchema7 } from "json-schema";
import type {
  ModelAdapter,
  GenerateOptions,
  GenerateResult,
  ToolDefinition,
} from "../types.js";
import type { ModelConfig } from "../index.js";

function convertToJsonSchema(parameters: Record<string, unknown>): JSONSchema7 {
  const properties: Record<string, JSONSchema7> = {};
  const required: string[] = [];

  for (const [key, value] of Object.entries(parameters)) {
    const param = value as { type?: string; description?: string };
    properties[key] = {
      type: (param.type as JSONSchema7["type"]) || "string",
      description: param.description,
    };
    required.push(key);
  }

  return { type: "object", properties, required };
}

function convertToolDefinition(toolDef: ToolDefinition) {
  const schema = convertToJsonSchema(toolDef.parameters);
  return tool({
    description: toolDef.description,
    inputSchema: jsonSchema(schema),
  });
}

export function createAzureAdapter(config: ModelConfig): ModelAdapter {
  const apiKey = process.env[config.envKey];
  const endpoint = config.envEndpoint ? process.env[config.envEndpoint] : undefined;

  if (!apiKey) {
    throw new Error(`Missing API key: ${config.envKey} environment variable not set`);
  }

  if (!endpoint) {
    throw new Error(
      `Missing endpoint: ${config.envEndpoint} environment variable not set`
    );
  }

  const azure = createAzure({
    apiKey,
    resourceName: extractResourceName(endpoint),
  });

  return {
    id: config.id,
    name: config.name,

    async generate(prompt: string, options?: GenerateOptions): Promise<GenerateResult> {
      const startTime = Date.now();

      const tools = options?.tools
        ? Object.fromEntries(
            options.tools.map((t) => [t.name, convertToolDefinition(t)])
          )
        : undefined;

      const result = await generateText({
        model: azure(config.deployment || config.id),
        prompt,
        system: options?.systemPrompt,
        maxOutputTokens: options?.maxTokens,
        // Skip temperature for reasoning models (they don't support it)
        temperature: config.reasoningModel ? undefined : options?.temperature,
        tools,
      });

      const latencyMs = Date.now() - startTime;

      return {
        text: result.text,
        toolCalls: result.toolCalls?.map((tc) => ({
          id: tc.toolCallId,
          name: tc.toolName,
          arguments: tc.input as Record<string, unknown>,
        })),
        usage: {
          promptTokens: result.usage?.inputTokens ?? 0,
          completionTokens: result.usage?.outputTokens ?? 0,
        },
        latencyMs,
      };
    },
  };
}

function extractResourceName(endpoint: string): string {
  const match = endpoint.match(/https:\/\/([^.]+)/);
  return match?.[1] ?? endpoint;
}
