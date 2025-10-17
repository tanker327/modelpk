# Model Pricing Update Instructions

**Purpose:** This document provides step-by-step instructions for using an LLM (like Claude) to update AI model pricing information in the AI Racers project.

**Last Updated:** 2025-01-16

---

## Overview

The AI Racers project maintains pricing data for all supported AI models to display cost estimates to users. This pricing data must be periodically updated as providers change their pricing.

### Files to Update

When updating pricing, you need to modify **two files**:

1. **`src/data/modelPricing.json`** - The source data file containing all pricing information
2. **`docs/MODEL_PRICING.md`** - Human-readable documentation with pricing tables

---

## Step 1: Gather Current Pricing from Official Sources

### Official Pricing URLs by Provider

| Provider | Official Pricing URL | Notes |
|----------|---------------------|-------|
| **OpenAI** | https://openai.com/api/pricing/ | Check for GPT-5, GPT-4, and GPT-3.5 models |
| **Google Gemini** | https://ai.google.dev/gemini-api/docs/pricing | Check Gemini 2.5, 2.0, 1.5, and 1.0 series |
| **Anthropic Claude** | https://claude.com/pricing | Check Claude 4.x and 3.x series |
| **xAI Grok** | https://x.ai/api or https://docs.x.ai/docs/models | Check Grok 4 Fast and Beta models |
| **OpenRouter** | https://openrouter.ai/models | Aggregates many providers with markup |
| **Ollama** | N/A - Local only | Always free ($0.00) |

### LLM Prompt Template for Gathering Pricing

```
Please fetch the latest pricing information for [PROVIDER_NAME] models from [OFFICIAL_URL].

I need the following information for each model:
1. Model name/ID
2. Input price (per 1M tokens)
3. Output price (per 1M tokens)
4. Context window size
5. Any special notes (cache discounts, tiered pricing, etc.)

Format the response as a structured table.
```

---

## Step 2: Update `src/data/modelPricing.json`

### File Structure

```json
{
  "lastUpdated": "YYYY-MM-DD",
  "currency": "USD",
  "models": {
    "provider_id": {
      "model-name": {
        "inputPrice": 0.00,
        "outputPrice": 0.00,
        "unit": "per 1M tokens",
        "contextWindow": 0,
        "notes": "Optional notes about pricing tiers, discounts, etc."
      }
    }
  },
  "notes": {
    "provider_id": "Description of pricing source"
  }
}
```

### ModelPrice Interface

The pricing service (`src/services/pricing/pricingService.ts`) uses this TypeScript interface:

```typescript
export interface ModelPrice {
  inputPrice: number      // Price per 1M input tokens (USD)
  outputPrice: number     // Price per 1M output tokens (USD)
  unit: string           // Always "per 1M tokens"
  contextWindow?: number  // Optional: Max context window in tokens
  notes?: string         // Optional: Special pricing info
}
```

### Update Instructions

1. **Update the `lastUpdated` field** at the top to today's date (YYYY-MM-DD format)

2. **For each provider section**, update or add model entries:
   - Use exact model IDs as they appear in API responses
   - Prices must be in USD per 1 million tokens
   - Include `contextWindow` for reference
   - Add `notes` for tiered pricing, discounts, or special conditions

3. **Verify existing models** - Check if prices have changed

4. **Add new models** - Add entries for newly released models

5. **Remove deprecated models** - Only if they're no longer available (keep for backward compatibility otherwise)

### Example Update

```json
{
  "lastUpdated": "2025-01-16",
  "currency": "USD",
  "models": {
    "openai": {
      "gpt-5-mini": {
        "inputPrice": 0.25,
        "outputPrice": 2.00,
        "unit": "per 1M tokens",
        "contextWindow": 272000,
        "notes": "80% of GPT-5 performance at 20% cost, 90% cache discount"
      }
    }
  }
}
```

### Special Cases

#### Tiered Pricing

For models with context-dependent pricing (e.g., Gemini 2.5 Pro, Grok 4 Fast):
- Use **base tier pricing** in the main fields
- Document extended pricing in the `notes` field

Example:
```json
"gemini-2.5-pro": {
  "inputPrice": 1.25,
  "outputPrice": 10.00,
  "unit": "per 1M tokens",
  "contextWindow": 2000000,
  "notes": "Extended context (>200K): $2.50 input, $15.00 output"
}
```

#### Free Models

For free models (preview/experimental):
```json
"gemini-2.0-flash-exp": {
  "inputPrice": 0.00,
  "outputPrice": 0.00,
  "unit": "per 1M tokens",
  "contextWindow": 1000000,
  "notes": "Free during preview"
}
```

#### Wildcard Entries

For providers where all models have the same pricing (like Ollama):
```json
"ollama": {
  "*": {
    "inputPrice": 0.00,
    "outputPrice": 0.00,
    "unit": "per 1M tokens",
    "notes": "Free - runs locally"
  }
}
```

---

## Step 3: Update `docs/MODEL_PRICING.md`

### Document Structure

The documentation file contains:
1. **Introduction** - Overview and table of contents
2. **Provider sections** - One section per provider with pricing tables
3. **Pricing verification section** - How pricing is verified and calculated
4. **Important notes** - Context pricing, caching, disclaimers

### Update Process

For each provider section:

1. **Update the pricing tables** to match the JSON data
2. **Verify the official source URL** is still correct
3. **Add new models** to the appropriate table
4. **Update notes** about special pricing conditions

### Markdown Table Format

```markdown
### Provider Series Name

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| model-id | $X.XX | $X.XX | XXK | Optional notes |
```

### Example Update

```markdown
### GPT-5 Series

| Model | Input Price | Output Price | Context Window | Notes |
|-------|-------------|--------------|----------------|-------|
| gpt-5 | $1.25 | $10.00 | 272K | 90% cache discount on repeated tokens |
| gpt-5-mini | $0.25 | $2.00 | 272K | 80% of GPT-5 performance at 20% cost |
| gpt-5-nano | $0.05 | $0.40 | 272K | Most economical GPT-5 variant |
```

---

## Step 4: Verify the Changes

### Build and Test

After updating both files, verify everything works:

```bash
# Build the project
npm run build

# Check for TypeScript errors
npm run lint
```

### Test Pricing Calculation

The pricing service automatically:
1. **Exact match** - Looks for exact model ID match
2. **Wildcard match** - Checks for `*` entry (e.g., Ollama)
3. **Fuzzy match** - Normalizes model names by removing:
   - Date suffixes (e.g., `-2025-08-07`)
   - Version numbers (e.g., `-v2`)
   - Then finds longest matching base name

Example fuzzy matches:
- `gpt-5-mini-2025-08-07` → matches `gpt-5-mini`
- `claude-sonnet-4.5-20250115` → matches `claude-sonnet-4.5`
- `grok-4-fast-non-reasoning` → matches `grok-4-fast-non-reasoning` (exact)

### Manual Verification Checklist

- [ ] `lastUpdated` date is current
- [ ] All prices are in USD per 1M tokens
- [ ] JSON file is valid (no syntax errors)
- [ ] Documentation tables match JSON data
- [ ] Official source URLs are correct
- [ ] Special pricing notes are documented
- [ ] Project builds without errors

---

## Step 5: Commit and Document Changes

### Git Commit Message Template

```
Update model pricing - [Month Year]

Updated pricing data from official sources:
- [Provider 1]: [changes made]
- [Provider 2]: [changes made]

Files updated:
- src/data/modelPricing.json
- docs/MODEL_PRICING.md

Verified against official pricing as of YYYY-MM-DD.
```

### Example Commit Message

```
Update model pricing - January 2025

Updated pricing data from official sources:
- OpenAI: Added GPT-5 series pricing
- Gemini: Added 2.5 Flash-Lite, updated 2.0 Flash
- xAI: Added Grok 4 Fast series

Files updated:
- src/data/modelPricing.json
- docs/MODEL_PRICING.md

Verified against official pricing as of 2025-01-16.
```

---

## Complete LLM Update Workflow

### Full Prompt Template for LLM

```
I need to update the AI model pricing data in the AI Racers project. Please help me with the following:

1. **Fetch Current Pricing:**
   - OpenAI: https://openai.com/api/pricing/
   - Google Gemini: https://ai.google.dev/gemini-api/docs/pricing
   - Anthropic Claude: https://claude.com/pricing
   - xAI Grok: https://docs.x.ai/docs/models
   - OpenRouter: https://openrouter.ai/models

2. **Compare with Current Data:**
   - Review src/data/modelPricing.json
   - Identify changes and new models

3. **Update Both Files:**
   - Update src/data/modelPricing.json with new pricing
   - Update docs/MODEL_PRICING.md to match
   - Set lastUpdated to today's date

4. **Verify:**
   - Ensure JSON is valid
   - Check all tables in documentation match JSON data
   - Verify official source URLs are correct

Please provide:
- Summary of pricing changes
- Updated JSON snippets
- Updated Markdown table snippets
- List of new models added
- List of deprecated models (if any)
```

---

## Pricing Calculation Logic

### How Costs Are Calculated

The pricing service (`src/services/pricing/pricingService.ts`) calculates costs as:

```typescript
inputCost = (promptTokens / 1,000,000) × inputPrice
outputCost = (completionTokens / 1,000,000) × outputPrice
totalCost = inputCost + outputCost
```

### Display Formatting Rules

| Total Cost | Display Format | Example |
|------------|----------------|---------|
| $0.00 | "Free" | Free |
| < $0.0001 | "<$0.0001" | <$0.0001 |
| $0.0001 - $0.01 | 4 decimals | $0.0023 |
| ≥ $0.01 | 3 decimals | $0.123 |

### Cost Color Coding (UI)

The UI displays costs with color coding:
- **Green** (`text-green-600`) - Cheapest model in comparison
- **Red** (`text-red-600`) - Most expensive model in comparison
- **Gray** (`text-gray-600`) - Middle-range costs

---

## Troubleshooting

### Common Issues

**Issue:** Model not found in pricing data
- **Solution:** Add the model to `modelPricing.json` under the correct provider

**Issue:** Cost showing as "undefined"
- **Solution:** Check that `inputPrice` and `outputPrice` are numbers, not strings

**Issue:** Fuzzy matching not working
- **Solution:** Check `normalizeModelName()` function in `pricingService.ts` handles the model name format

**Issue:** Documentation tables don't match JSON
- **Solution:** Review both files side-by-side and update tables to match JSON exactly

### Getting Help

1. Check the pricing service code: `src/services/pricing/pricingService.ts`
2. Review the schema: `ModelPrice` interface
3. Test with actual API responses to verify model IDs
4. Open an issue on GitHub if official pricing source changes

---

## Maintenance Schedule

### Recommended Update Frequency

- **Monthly**: Check all providers for pricing changes
- **Quarterly**: Comprehensive review of all models
- **Ad-hoc**: When new models are released or providers announce pricing changes

### Monitoring for Changes

Watch these sources for announcements:
- Provider blog posts and changelogs
- API documentation update notifications
- Community forums (Reddit, Twitter/X, Discord)
- Official provider newsletters

---

## Appendix: Provider-Specific Notes

### OpenAI

- Pricing structure: Input/output rates differ significantly
- Cache discounts available (GPT-5 series)
- Batch API offers 50% discount
- Watch for: Model deprecations, new model releases

### Google Gemini

- Tiered pricing based on context window length
- Free experimental models during preview
- Thinking mode charges extra
- Watch for: Flash model variants, preview → GA transitions

### Anthropic Claude

- Prompt caching available with 90% discount
- Extended context pricing for >200K tokens
- Model naming includes date stamps
- Watch for: New Claude 4.x releases, Haiku updates

### xAI Grok

- Extended context pricing (>128K) costs 2.5x more
- Cached tokens get 75% discount
- Reasoning vs non-reasoning variants
- Watch for: Grok 4 updates, Beta → Stable transitions

### OpenRouter

- Aggregates multiple providers
- Includes small markup over base pricing
- Free tier models available
- Watch for: New provider additions, routing changes

### Ollama

- Always free (runs locally)
- No API costs
- Performance depends on hardware
- Watch for: N/A (pricing doesn't change)

---

## Summary Checklist

When updating pricing, ensure you:

- [ ] Fetch latest pricing from all official sources
- [ ] Update `src/data/modelPricing.json` with new data
- [ ] Update `lastUpdated` field to current date
- [ ] Update `docs/MODEL_PRICING.md` tables to match
- [ ] Verify JSON syntax is valid
- [ ] Build project successfully
- [ ] Test fuzzy matching works for versioned models
- [ ] Commit with descriptive message
- [ ] Document what changed and why

---

**Remember:** Accurate pricing data is critical for users making cost-sensitive decisions. Always verify against official sources and double-check your updates before committing!
