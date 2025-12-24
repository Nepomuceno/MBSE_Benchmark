# Model Configuration Reference

Reference guide for configuring models in `config/models.json`.

## Model Configuration Properties

| Property | Type | Description |
| -------- | ---- | ----------- |
| `id` | string | Unique model identifier used in CLI commands |
| `name` | string | Human-readable display name |
| `provider` | string | `azure`, `openai`, or `openai-compatible` |
| `envKey` | string | Environment variable name for API key |
| `envEndpoint` | string | Environment variable name for endpoint URL |
| `deployment` | string | Azure deployment name (azure provider only) |
| `model` | string | Model identifier (openai-compatible provider only) |
| `reasoningModel` | boolean | Model uses reasoning tokens (o-series, GPT-5) |
| `supportsResponses` | boolean | Use Azure Responses API vs Chat Completions API |
| `supportsTools` | boolean | Model supports tool/function calling |

## Azure OpenAI Models

Models deployed through Azure OpenAI Service.

| Model | Responses API | Chat API | Tools | Reasoning | Notes |
| ----- | ------------- | -------- | ----- | --------- | ----- |
| GPT-5.2 | ✅ | ✅ | ✅ | ✅ | Latest flagship, full feature support |
| GPT-5.1 | ✅ | ✅ | ✅ | ✅ | Codex variants for coding tasks |
| GPT-5.0 | ✅ | ✅ | ✅ | ✅ | Base GPT-5 model |
| GPT-4.1 | ✅ | ✅ | ✅ | ❌ | General purpose, Responses API recommended |
| GPT-4o | ✅ | ✅ | ✅ | ❌ | Multimodal (text, image, audio) |
| GPT-4o-mini | ✅ | ✅ | ✅ | ❌ | Cost-optimized GPT-4o |
| o1 | ✅ | ✅ | ✅ | ✅ | Reasoning model, complex problem solving |
| o1-mini | ✅ | ✅ | ✅ | ✅ | Faster reasoning model |
| o3 | ✅ | ✅ | ✅ | ✅ | Enhanced reasoning, parallel tool calls |
| o3-mini | ✅ | ✅ | ✅ | ✅ | Cost-optimized o3 |
| o4-mini | ✅ | ✅ | ✅ | ✅ | Latest reasoning model |

## Azure Foundry Models (Non-OpenAI)

Models available through Azure AI Foundry marketplace.

| Model | Responses API | Chat API | Tools | Reasoning | Notes |
| ----- | ------------- | -------- | ----- | --------- | ----- |
| DeepSeek-V3 | ❌ | ✅ | ✅ | ❌ | General purpose with function calling |
| DeepSeek-V3-0324 | ❌ | ✅ | ✅ | ❌ | Improved function calling accuracy |
| DeepSeek-V3.2 | ❌ | ✅ | ✅ | ❌ | Agentic reasoning, multi-step tool use |
| DeepSeek-V3.2-Special | ❌ | ✅ | ❌ | ✅ | Pure reasoning, no tool support |
| DeepSeek-R1 | ❌ | ✅ | ✅ | ✅ | Reasoning with reduced hallucination |
| DeepSeek-R1-0528 | ❌ | ✅ | ✅ | ✅ | Enhanced reasoning and tool support |
| Phi-4 | ❌ | ✅ | ❌ | ❌ | Lightweight, limited capabilities |
| Phi-4 Reasoning | ❌ | ✅ | ❌ | ✅ | Reasoning variant, no tool support |
| Llama-3.3-70B-Instruct | ❌ | ✅ | ✅ | ❌ | Standard instruct model |
| Llama-4-Maverick-17B | ❌ | ✅ | ✅ | ❌ | Agentic features |
| Mistral Large | ❌ | ✅ | ✅ | ❌ | Function calling supported |
| Mistral Small | ❌ | ✅ | ✅ | ❌ | Cost-optimized |

## API Selection

The Azure adapter selects the API based on `supportsResponses`:

```text
supportsResponses: true  → azure()      (Responses API)
supportsResponses: false → azure.chat() (Chat Completions API)
```

### When to use Responses API

- OpenAI models (GPT-4o, GPT-5, o-series)
- Need reasoning effort control
- Want stateful conversations
- Using latest model features

### When to use Chat Completions API

- Non-OpenAI models (DeepSeek, Phi, Llama, Mistral)
- Simple chat/completion workflows
- Broader model compatibility

## Tool Support

Models with `supportsTools: false` will not receive tool definitions (tools are disabled for these models).

Consider this when:

- Evaluating benchmark results
- Comparing models with different capabilities
- Some tasks require tool use for full scores

## Example Configuration

```json
{
  "id": "gpt-4o",
  "name": "GPT-4o",
  "provider": "azure",
  "envKey": "AZURE_OPENAI_API_KEY",
  "envEndpoint": "AZURE_OPENAI_ENDPOINT",
  "deployment": "gpt-4o",
  "supportsResponses": true,
  "supportsTools": true
}
```

```json
{
  "id": "deepseek-v3",
  "name": "DeepSeek V3",
  "provider": "azure",
  "envKey": "AZURE_OPENAI_API_KEY",
  "envEndpoint": "AZURE_OPENAI_ENDPOINT",
  "deployment": "DeepSeek-V3",
  "supportsResponses": false,
  "supportsTools": true
}
```

## Documentation References

- [Azure OpenAI Responses API](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/responses)
- [Azure OpenAI Function Calling](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/function-calling)
- [Azure Foundry Models Catalog](https://learn.microsoft.com/en-us/azure/ai-foundry/foundry-models/concepts/models-sold-directly-by-azure)
- [OpenAI Reasoning Models Guide](https://platform.openai.com/docs/guides/reasoning)
