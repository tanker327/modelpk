# AI Model Pricing Documentation

**Last Updated:** 2026-03-18
**Currency:** USD

This document provides a comprehensive overview of pricing for all AI models supported by AI Racers. All prices are per 1 million tokens unless otherwise specified.

---

## Table of Contents

- [OpenAI Models](#openai-models)
- [Google Gemini Models](#google-gemini-models)
- [Anthropic Claude Models](#anthropic-claude-models)
- [xAI Grok Models](#xai-grok-models)
- [Ollama Models](#ollama-models)
- [DeepSeek Models](#deepseek-models)
- [OpenRouter Models](#openrouter-models)
- [Pricing Verification](#pricing-verification)

---

## OpenAI Models

**Source:** [https://openai.com/api/pricing/](https://openai.com/api/pricing/)

### GPT-5.4 Series (Latest)

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| gpt-5.4 | $2.50 | $15.00 | 1.05M | Latest flagship, 50% batch discount |
| gpt-5.4-mini | $0.75 | $4.50 | 400K | |
| gpt-5.4-nano | $0.20 | $1.25 | 400K | |

### GPT-5 Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| gpt-5.2 | $1.75 | $14.00 | 400K | |
| gpt-5 | $1.25 | $10.00 | 400K | 90% cache discount on repeated tokens |
| gpt-5-mini | $0.25 | $2.00 | 400K | |

### GPT-4.1 Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| gpt-4.1 | $2.00 | $8.00 | 1M | |
| gpt-4.1-mini | $0.40 | $1.60 | 1M | |
| gpt-4.1-nano | $0.10 | $0.40 | 1M | Most economical OpenAI model |

### Reasoning Models (o-series)

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| o3 | $2.00 | $8.00 | 200K | Reasoning tokens billed as output |
| o3-mini | $1.10 | $4.40 | 200K | Reasoning tokens billed as output |
| o4-mini | $1.10 | $4.40 | 200K | Reasoning tokens billed as output |
| o1 | $15.00 | $60.00 | 200K | Legacy reasoning model |

### GPT-4o Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| gpt-4o | $2.50 | $10.00 | 128K | |
| gpt-4o-mini | $0.15 | $0.60 | 128K | |

### Legacy Models

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| gpt-4-turbo | $10.00 | $30.00 | 128K | Legacy |
| gpt-3.5-turbo | $0.25 | $0.75 | 16K | Superseded by GPT-4o Mini |

**Model Matching:** The pricing service automatically matches versioned models (e.g., `gpt-5.4-mini-2026-03-17`) to their base pricing.

---

## Google Gemini Models

**Source:** [https://ai.google.dev/gemini-api/docs/pricing](https://ai.google.dev/gemini-api/docs/pricing)

### Gemini 3 Series (Preview)

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| gemini-3-pro | $2.00 | $12.00 | 1M | Preview. Extended context (>200K): $4.00 in, $18.00 out |
| gemini-3-flash | $0.50 | $3.00 | 1M | Preview |

### Gemini 2.5 Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| gemini-2.5-pro | $1.25 | $10.00 | 2M | Extended context (>200K): $2.50 in, $20.00 out |
| gemini-2.5-flash | $0.30 | $2.50 | 1M | Flat pricing regardless of context |
| gemini-2.5-flash-lite | $0.10 | $0.40 | 1M | Fastest, most cost-efficient |

### Gemini 2.0 Series (Deprecated)

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| gemini-2.0-flash | $0.10 | $0.40 | 1M | Deprecated, shutting down June 1, 2026 |
| gemini-2.0-flash-lite | $0.075 | $0.30 | 1M | Deprecated |

### Gemini 1.5 Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| gemini-1.5-pro | $1.25 | $5.00 | 2M | Advanced reasoning |
| gemini-1.5-flash | $0.075 | $0.30 | 1M | |

### Gemini 1.0 Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| gemini-1.0-pro | $0.50 | $1.50 | 32K | Legacy model |

---

## Anthropic Claude Models

**Source:** [https://claude.com/pricing](https://claude.com/pricing)

### Claude 4.6 Series (Latest)

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| claude-opus-4.6 | $5.00 | $25.00 | 1M | Latest flagship, 1M context at standard pricing |
| claude-sonnet-4.6 | $3.00 | $15.00 | 1M | 1M context at standard pricing |

### Claude 4.5 Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| claude-opus-4.5 | $5.00 | $25.00 | 1M | |
| claude-sonnet-4.5 | $3.00 | $15.00 | 1M | 1M context now at standard pricing (no surcharge) |
| claude-haiku-4.5 | $1.00 | $5.00 | 200K | Fast and efficient |

### Claude 4.x Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| claude-opus-4.1 | $15.00 | $75.00 | 200K | |
| claude-opus-4 | $15.00 | $75.00 | 200K | |
| claude-sonnet-4 | $3.00 | $15.00 | 200K | |

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

**Note:** Prompt caching available with up to 90% cost savings on cached tokens. Batch API offers 50% discount.

---

## xAI Grok Models

**Source:** [https://x.ai/api](https://x.ai/api) | [https://docs.x.ai/docs/models](https://docs.x.ai/docs/models)

### Grok 4 Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| grok-4 | $3.00 | $15.00 | 256K | Flagship. Cached: $0.75 input |
| grok-4.20-beta | $2.00 | $6.00 | 2M | Beta. Reasoning & non-reasoning variants. Cached: $0.20 input |

### Grok Fast Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| grok-4.1-fast | $0.20 | $0.50 | 2M | Latest fast model. Cached: $0.05 input |
| grok-4-fast | $0.20 | $0.50 | 2M | Extended context (>128K): $0.40 in, $1.00 out |

### Grok 3 Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| grok-3 | $3.00 | $15.00 | 131K | Cached: $0.75 input |
| grok-3-mini | $0.30 | $0.50 | 131K | Cached: $0.07 input |

### Grok Beta Series (Legacy)

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| grok-beta | $5.00 | $15.00 | 131K | Legacy |
| grok-vision-beta | $5.00 | $15.00 | 8K | Legacy, with vision |

**Note:** Batch API offers 50% discount. New user credits: $25 free on signup.

---

## Ollama Models

**Source:** Local deployment

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| All Models (*) | $0.00 | $0.00 | Varies | Free - runs locally on your hardware |

**Note:** Ollama models run entirely on your local machine, so there are no API costs. Performance depends on your hardware.

---

## DeepSeek Models

**Source:** [https://api-docs.deepseek.com/quick_start/pricing](https://api-docs.deepseek.com/quick_start/pricing)

### DeepSeek V3.2 (Current)

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| deepseek-chat | $0.28 | $0.42 | 128K | Cache hit: $0.028 input. V3.2 (Non-thinking Mode) |
| deepseek-reasoner | $0.28 | $0.42 | 128K | Cache hit: $0.028 input. V3.2 (Thinking Mode) |

**Cache Pricing:**
- Cache Miss: $0.28 per 1M input tokens
- Cache Hit: $0.028 per 1M input tokens (90% discount)

**Note:** DeepSeek-V3.2 replaces both the older DeepSeek-V3 and DeepSeek-R1 with a unified model. The deprecated `deepseek-v3` and `deepseek-v3.2-exp` model IDs have been removed.

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

All pricing data in this document has been verified against official sources as of 2026-03-18:

1. **OpenAI:** Verified via official API pricing page (openai.com/api/pricing/)
2. **Google Gemini:** Verified via official pricing page (ai.google.dev/gemini-api/docs/pricing)
3. **Anthropic Claude:** Verified via official pricing page (claude.com/pricing)
4. **xAI Grok:** Verified via official API documentation (docs.x.ai/developers/models)
5. **DeepSeek:** Verified via official pricing page (api-docs.deepseek.com/quick_start/pricing)
6. **OpenRouter:** Pricing reflects pass-through costs with potential markup

### Fuzzy Model Matching

The pricing service includes intelligent model name matching:

- **Date suffix removal:** `gpt-5.4-mini-2026-03-17` → `gpt-5.4-mini`
- **Version normalization:** `claude-sonnet-4.6-v2` → `claude-sonnet-4.6`
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

- **Gemini 2.5 Pro:** Input doubles, output doubles for prompts > 200K tokens
- **Gemini 3 Pro:** Input doubles, output 1.5x for prompts > 200K tokens
- **Grok 4 Fast:** Prices increase 2x for contexts > 128K tokens

The pricing service currently uses base-tier pricing for cost estimates.

### Caching Discounts

Several providers offer significant discounts for cached tokens:

- **OpenAI GPT-5:** 90% discount on repeated input tokens
- **Anthropic Claude:** Up to 90% discount with prompt caching (cache reads at 0.1x base)
- **xAI Grok:** 75-90% discount on cached input tokens
- **DeepSeek:** 90% discount on cache hits ($0.028 vs $0.28 per 1M tokens)

These discounts are not reflected in the cost estimates shown in the UI.

### Batch API Discounts

Most providers now offer batch/async API pricing at 50% off standard rates:

- **OpenAI:** 50% off all models via Batch API
- **Anthropic:** 50% off via Batch API
- **xAI:** 50% off via Batch API

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
