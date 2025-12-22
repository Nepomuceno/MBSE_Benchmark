import { describe, test, expect } from "bun:test";
import { loadModels, getModel, createModelClient } from "./index.js";
import type { ModelConfig } from "./index.js";

describe("models", () => {
  describe("loadModels", () => {
    test("returns array of models", () => {
      const models = loadModels();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
    });

    test("models have required fields", () => {
      const models = loadModels();
      for (const model of models) {
        expect(model.id).toBeDefined();
        expect(model.name).toBeDefined();
        expect(model.provider).toBeDefined();
        expect(["azure", "openai", "openai-compatible"]).toContain(model.provider);
      }
    });
  });

  describe("getModel", () => {
    test("returns model by id", () => {
      const models = loadModels();
      const firstModel = models[0];
      if (!firstModel) {
        throw new Error("No models loaded");
      }
      const found = getModel(firstModel.id);
      expect(found).toEqual(firstModel);
    });

    test("returns undefined for unknown id", () => {
      const found = getModel("non-existent-model");
      expect(found).toBeUndefined();
    });
  });

  describe("createModelClient", () => {
    test("throws for missing API key", () => {
      const config: ModelConfig = {
        id: "test-azure",
        name: "Test Azure",
        provider: "azure",
        envKey: "NON_EXISTENT_KEY",
        envEndpoint: "NON_EXISTENT_ENDPOINT",
        deployment: "test",
      };

      expect(() => createModelClient(config)).toThrow("Missing API key");
    });

    test("throws for missing endpoint", () => {
      const originalEnv = process.env.TEST_API_KEY;
      process.env.TEST_API_KEY = "test-key";

      const config: ModelConfig = {
        id: "test-azure",
        name: "Test Azure",
        provider: "azure",
        envKey: "TEST_API_KEY",
        envEndpoint: "NON_EXISTENT_ENDPOINT",
        deployment: "test",
      };

      try {
        expect(() => createModelClient(config)).toThrow("Missing endpoint");
      } finally {
        if (originalEnv === undefined) {
          delete process.env.TEST_API_KEY;
        } else {
          process.env.TEST_API_KEY = originalEnv;
        }
      }
    });

    test("throws for unsupported provider", () => {
      const config = {
        id: "test",
        name: "Test",
        provider: "unknown" as "azure",
        envKey: "TEST_KEY",
      };

      expect(() => createModelClient(config)).toThrow("Unknown provider");
    });

    test("creates azure adapter when credentials exist", () => {
      const originalKey = process.env.TEST_AZURE_KEY;
      const originalEndpoint = process.env.TEST_AZURE_ENDPOINT;
      process.env.TEST_AZURE_KEY = "test-key";
      process.env.TEST_AZURE_ENDPOINT = "https://test.openai.azure.com";

      const config: ModelConfig = {
        id: "test-azure",
        name: "Test Azure",
        provider: "azure",
        envKey: "TEST_AZURE_KEY",
        envEndpoint: "TEST_AZURE_ENDPOINT",
        deployment: "test-deployment",
      };

      try {
        const adapter = createModelClient(config);
        expect(adapter.id).toBe("test-azure");
        expect(adapter.name).toBe("Test Azure");
        expect(typeof adapter.generate).toBe("function");
      } finally {
        if (originalKey === undefined) delete process.env.TEST_AZURE_KEY;
        else process.env.TEST_AZURE_KEY = originalKey;
        if (originalEndpoint === undefined) delete process.env.TEST_AZURE_ENDPOINT;
        else process.env.TEST_AZURE_ENDPOINT = originalEndpoint;
      }
    });

    test("creates local adapter", () => {
      const config: ModelConfig = {
        id: "test-local",
        name: "Test Local",
        provider: "openai-compatible",
        envKey: "",
        model: "test-model",
      };

      const adapter = createModelClient(config);
      expect(adapter.id).toBe("test-local");
      expect(adapter.name).toBe("Test Local");
      expect(typeof adapter.generate).toBe("function");
    });
  });
});
