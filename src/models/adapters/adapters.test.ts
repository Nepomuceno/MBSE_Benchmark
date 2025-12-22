import { describe, test, expect } from "bun:test";
import { createAzureAdapter } from "./azure.js";
import { createLocalAdapter } from "./local.js";
import type { ModelConfig } from "../index.js";

describe("Azure Adapter", () => {
  test("creates adapter with valid config", () => {
    const originalKey = process.env.TEST_AZURE_KEY;
    const originalEndpoint = process.env.TEST_AZURE_ENDPOINT;
    process.env.TEST_AZURE_KEY = "test-key";
    process.env.TEST_AZURE_ENDPOINT = "https://test.openai.azure.com";

    const config: ModelConfig = {
      id: "test-model",
      name: "Test Model",
      provider: "azure",
      envKey: "TEST_AZURE_KEY",
      envEndpoint: "TEST_AZURE_ENDPOINT",
      deployment: "test-deployment",
    };

    try {
      const adapter = createAzureAdapter(config);
      expect(adapter.id).toBe("test-model");
      expect(adapter.name).toBe("Test Model");
      expect(typeof adapter.generate).toBe("function");
    } finally {
      if (originalKey === undefined) delete process.env.TEST_AZURE_KEY;
      else process.env.TEST_AZURE_KEY = originalKey;
      if (originalEndpoint === undefined) delete process.env.TEST_AZURE_ENDPOINT;
      else process.env.TEST_AZURE_ENDPOINT = originalEndpoint;
    }
  });

  test("throws for missing API key", () => {
    const config: ModelConfig = {
      id: "test",
      name: "Test",
      provider: "azure",
      envKey: "NONEXISTENT_KEY",
      envEndpoint: "NONEXISTENT_ENDPOINT",
    };

    expect(() => createAzureAdapter(config)).toThrow("Missing API key");
  });

  test("throws for missing endpoint", () => {
    const originalKey = process.env.TEST_AZURE_KEY;
    process.env.TEST_AZURE_KEY = "test-key";

    const config: ModelConfig = {
      id: "test",
      name: "Test",
      provider: "azure",
      envKey: "TEST_AZURE_KEY",
      envEndpoint: "NONEXISTENT_ENDPOINT",
    };

    try {
      expect(() => createAzureAdapter(config)).toThrow("Missing endpoint");
    } finally {
      if (originalKey === undefined) delete process.env.TEST_AZURE_KEY;
      else process.env.TEST_AZURE_KEY = originalKey;
    }
  });
});

describe("Local Adapter", () => {
  test("creates adapter with minimal config", () => {
    const config: ModelConfig = {
      id: "local-model",
      name: "Local Model",
      provider: "openai-compatible",
      envKey: "",
      model: "test-model",
    };

    const adapter = createLocalAdapter(config);
    expect(adapter.id).toBe("local-model");
    expect(adapter.name).toBe("Local Model");
    expect(typeof adapter.generate).toBe("function");
  });

  test("creates adapter with custom endpoint", () => {
    const originalEndpoint = process.env.TEST_LOCAL_ENDPOINT;
    process.env.TEST_LOCAL_ENDPOINT = "http://localhost:8080/v1";

    const config: ModelConfig = {
      id: "local-model",
      name: "Local Model",
      provider: "openai-compatible",
      envKey: "",
      envEndpoint: "TEST_LOCAL_ENDPOINT",
      model: "custom-model",
    };

    try {
      const adapter = createLocalAdapter(config);
      expect(adapter.id).toBe("local-model");
    } finally {
      if (originalEndpoint === undefined) delete process.env.TEST_LOCAL_ENDPOINT;
      else process.env.TEST_LOCAL_ENDPOINT = originalEndpoint;
    }
  });
});
