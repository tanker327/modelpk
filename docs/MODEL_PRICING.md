# AI Model Pricing Documentation

**Last Updated:** 2025-10-18
**Currency:** USD

This document provides a comprehensive overview of pricing for all AI models supported by AI Racers. All prices are per 1 million tokens unless otherwise specified.

---

## Table of Contents

- [OpenAI Models](#openai-models)
- [Google Gemini Models](#google-gemini-models)
- [Anthropic Claude Models](#anthropic-claude-models)
- [xAI Grok Models](#xai-grok-models)
- [Ollama Models](#ollama-models)
- [OpenRouter Models](#openrouter-models)
- [Pricing Verification](#pricing-verification)

---

## OpenAI Models

**Source:** [https://openai.com/api/pricing/](https://openai.com/api/pricing/)

### GPT-5 Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| gpt-5 | $1.25 | $10.00 | 272K | 90% cache discount on repeated tokens |
| gpt-5-mini | $0.25 | $2.00 | 272K | 80% of GPT-5 performance at 20% cost |
| gpt-5-nano | $0.05 | $0.40 | 272K | Most economical GPT-5 variant |

### GPT-4 Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| gpt-4o | $2.50 | $10.00 | 128K | Optimized for chat |
| gpt-4o-mini | $0.15 | $0.60 | 128K | Cost-efficient with vision |
| gpt-4-turbo | $10.00 | $30.00 | 128K | High-performance variant |
| gpt-4 | $30.00 | $60.00 | 8K | Legacy model |

### GPT-3.5 Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| gpt-3.5-turbo | $0.50 | $1.50 | 16K | Fast and cost-effective |

**Model Matching:** The pricing service automatically matches versioned models (e.g., `gpt-5-mini-2025-08-07`) to their base pricing.

---

## Google Gemini Models

**Source:** [https://ai.google.dev/gemini-api/docs/pricing](https://ai.google.dev/gemini-api/docs/pricing)

### Gemini 2.5 Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| gemini-2.5-pro | $1.25 | $10.00 | 2M | Extended context (>200K): $2.50 in, $15.00 out |
| gemini-2.5-flash | $0.30 | $2.50 | 1M | Balanced performance |
| gemini-2.5-flash-lite | $0.10 | $0.40 | 1M | Fastest, most cost-efficient |

### Gemini 2.0 Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| gemini-2.0-flash | $0.10 | $0.40 | 1M | Fast processing |
| gemini-2.0-flash-lite | $0.075 | $0.30 | 1M | Even more economical |
| gemini-2.0-flash-exp | $0.00 | $0.00 | 1M | Free during preview |

### Gemini 1.5 Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| gemini-1.5-pro | $1.25 | $5.00 | 2M | Advanced reasoning |
| gemini-1.5-flash | $0.075 | $0.30 | 1M | 70%+ price reduction |

### Gemini 1.0 Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| gemini-1.0-pro | $0.50 | $1.50 | 32K | Legacy model |

---

## Anthropic Claude Models

**Source:** [https://claude.com/pricing](https://claude.com/pricing)

### Claude 4.x Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| claude-opus-4.1 | $15.00 | $75.00 | 200K | Highest capability |
| claude-sonnet-4.5 | $3.00 | $15.00 | 200K | Extended context (>200K): $6.00 in, $22.50 out |
| claude-haiku-4.5 | $1.00 | $5.00 | 200K | Fast and efficient |

### Claude 3.5 Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| claude-3-5-sonnet-20241022 | $3.00 | $15.00 | 200K | Latest 3.5 Sonnet |
| claude-3-5-haiku-20241022 | $0.80 | $4.00 | 200K | Latest 3.5 Haiku |

### Claude 3 Series (Legacy)

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| claude-3-opus-20240229 | $15.00 | $75.00 | 200K | Most capable 3.x |
| claude-3-sonnet-20240229 | $3.00 | $15.00 | 200K | Balanced |
| claude-3-haiku-20240307 | $0.25 | $1.25 | 200K | Fastest, most affordable |

**Note:** Prompt caching available with up to 90% cost savings on cached tokens.

---

## xAI Grok Models

**Source:** [https://x.ai/api](https://x.ai/api) | [https://docs.x.ai/docs/models](https://docs.x.ai/docs/models)

### Grok 4 Fast Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| grok-4-fast | $0.20 | $0.50 | 2M | Unified reasoning/non-reasoning |
| grok-4-fast-reasoning | $0.20 | $0.50 | 2M | With reasoning capabilities |
| grok-4-fast-non-reasoning | $0.20 | $0.50 | 2M | Without reasoning overhead |

**Extended Context Pricing (>128K tokens):**
- Input: $0.40 per 1M tokens
- Output: $1.00 per 1M tokens
- Cached Input: $0.05 per 1M tokens

### Grok Beta Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| grok-beta | $5.00 | $15.00 | 131K | Earlier version |
| grok-vision-beta | $5.00 | $15.00 | 8K | With vision capabilities |

**Note:** Grok 4 Fast offers significantly better value than Beta models.

---

## Ollama Models

**Source:** Local deployment

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| All Models (*) | $0.00 | $0.00 | Varies | Free - runs locally on your hardware |

**Note:** Ollama models run entirely on your local machine, so there are no API costs. Performance depends on your hardware.

---

## OpenRouter Models

**Source:** [https://openrouter.ai/models](https://openrouter.ai/models)

OpenRouter provides unified access to multiple AI providers. Pricing may include a small markup.

### Anthropic (via OpenRouter)

| Model | Input Price | Output Price | Context Window |
|-------|-------------|--------------|----------------|
| anthropic/claude-3.5-sonnet | $3.00 | $15.00 | 200K |
| anthropic/claude-3-opus | $15.00 | $75.00 | 200K |

### OpenAI (via OpenRouter)

| Model | Input Price | Output Price | Context Window |
|-------|-------------|--------------|----------------|
| openai/gpt-4o | $2.50 | $10.00 | 128K |
| openai/gpt-4o-mini | $0.15 | $0.60 | 128K |

### Google Gemini (via OpenRouter)

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| google/gemini-2.0-flash-exp:free | $0.00 | $0.00 | 1M | Free tier |
| google/gemini-pro-1.5 | $1.25 | $5.00 | 2M | |

### Meta Llama (via OpenRouter)

| Model | Input Price | Output Price | Context Window |
|-------|-------------|--------------|----------------|
| meta-llama/llama-3.1-405b-instruct | $2.70 | $2.70 | 131K |
| meta-llama/llama-3.1-70b-instruct | $0.52 | $0.75 | 131K |
| meta-llama/llama-3.1-8b-instruct | $0.055 | $0.055 | 131K |

### Mistral (via OpenRouter)

| Model | Input Price | Output Price | Context Window |
|-------|-------------|--------------|----------------|
| mistralai/mistral-large | $2.00 | $6.00 | 128K |
| mistralai/mistral-medium | $2.70 | $8.10 | 32K |

### Other Models (via OpenRouter)

| Model | Input Price | Output Price | Context Window |
|-------|-------------|--------------|----------------|
| qwen/qwen-2.5-72b-instruct | $0.40 | $0.40 | 131K |
| deepseek/deepseek-chat | $0.14 | $0.28 | 64K |

---

## Pricing Verification

### How Pricing is Verified

All pricing data in this document has been verified against official sources as of 2025-10-18:

1. **OpenAI:** Verified via web search and official API documentation
2. **Google Gemini:** Verified via official pricing page (ai.google.dev/gemini-api/docs/pricing)
3. **Anthropic Claude:** Verified via official pricing page (claude.com/pricing)
4. **xAI Grok:** Verified via official API documentation (docs.x.ai/docs/models)
5. **OpenRouter:** Pricing reflects pass-through costs with potential markup

### Fuzzy Model Matching

The pricing service includes intelligent model name matching:

- **Date suffix removal:** `gpt-5-mini-2025-08-07` → `gpt-5-mini`
- **Version normalization:** `claude-sonnet-4.5-v2` → `claude-sonnet-4.5`
- **Longest match priority:** More specific model names take precedence

This ensures pricing works automatically for new model versions without requiring JSON updates.

### Cost Calculation

The cost calculator (`src/services/pricing/pricingService.ts`) computes costs as:

```
inputCost = (promptTokens / 1,000,000) × inputPrice
outputCost = (completionTokens / 1,000,000) × outputPrice
totalCost = inputCost + outputCost
```

### Display Formatting

- `$0.00` → Displays as "Free"
- `< $0.0001` → Displays as "<$0.0001"
- `< $0.01` → Displays with 4 decimal places (e.g., "$0.0023")
- `≥ $0.01` → Displays with 3 decimal places (e.g., "$0.123")

---

## Important Notes

### Price Changes

- AI model pricing changes frequently. Always verify current pricing at official provider sources before making decisions.
- The `lastUpdated` field in `modelPricing.json` indicates when prices were last verified.
- We recommend checking official sources monthly for updates.

### Context Window Pricing Tiers

Some models have different pricing for different context lengths:

- **Gemini 2.5 Pro:** Prices double for prompts > 200K tokens
- **Claude Sonnet 4.5:** Prices increase 50-100% for prompts > 200K tokens
- **Grok 4 Fast:** Prices increase 2.5x for contexts > 128K tokens

The pricing service currently uses base-tier pricing for cost estimates.

### Caching Discounts

Several providers offer significant discounts for cached tokens:

- **OpenAI GPT-5:** 90% discount on repeated input tokens
- **Anthropic Claude:** Up to 90% discount with prompt caching
- **xAI Grok:** 75% discount on cached input tokens

These discounts are not reflected in the cost estimates shown in the UI.

### Free Tiers and Limits

- **Gemini 2.0 Flash Exp:** Free during preview period
- **Google/Gemini via OpenRouter:** Free tier available
- **Ollama:** All models free (runs locally)

Free tiers typically have rate limits and may require opt-in to data training.

---

## Support

For questions about pricing:

1. **Check official sources:** Links provided in each section
2. **Open an issue:** [GitHub Issues](https://github.com/your-repo/issues)
3. **Update pricing:** Submit a PR to update `src/data/modelPricing.json`

---

**Disclaimer:** Prices are subject to change by providers. This documentation is for reference only. Always verify current pricing before making cost-sensitive decisions.
