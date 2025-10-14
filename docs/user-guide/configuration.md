# LLM Provider Configuration Guide

This guide explains how to configure LLM API providers in AI Racers.

## Overview

AI Racers supports five LLM providers:
- **OpenAI** - GPT models
- **Gemini (Google)** - Gemini models
- **Anthropic** - Claude models
- **xAI** - Grok models
- **Ollama** - Local open-source models

## Accessing the Configuration Page

1. From the home page, click "Configure Providers"
2. Or navigate directly to `/config`

## Configuring Each Provider

### OpenAI

**Required:**
- API Key: Get from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

**Optional:**
- Base URL: Custom endpoint (default: `https://api.openai.com/v1`)

**Getting Your API Key:**
1. Log in to OpenAI Platform
2. Navigate to API Keys
3. Click "Create new secret key"
4. Copy and paste into AI Racers

### Gemini (Google)

**Required:**
- API Key: Get from [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

**Optional:**
- Base URL: Custom endpoint (default: `https://generativelanguage.googleapis.com/v1beta`)

**Getting Your API Key:**
1. Visit Google AI Studio
2. Click "Get API key"
3. Create or select a Google Cloud project
4. Copy and paste into AI Racers

**Note:** API keys start with "AIza"

### Anthropic

**Required:**
- API Key: Get from [https://console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)

**Optional:**
- Base URL: Custom endpoint (default: `https://api.anthropic.com/v1`)

**Getting Your API Key:**
1. Log in to Anthropic Console
2. Navigate to API Keys
3. Click "Create Key"
4. Copy immediately (shown only once)

### xAI

**Required:**
- API Key: Get from [https://console.x.ai/](https://console.x.ai/)

**Optional:**
- Base URL: Custom endpoint (default: `https://api.x.ai/v1`)

**Getting Your API Key:**
1. Log in to xAI Console
2. Navigate to API Keys section
3. Create a new API key
4. Copy and paste into AI Racers

**Note:** API keys start with "xai-". Rate limit: 5 requests per minute.

### Ollama (Local)

**Required:**
- Endpoint URL: Local Ollama server (default: `http://localhost:11434`)

**No API Key Required** - Ollama runs locally

**Setup:**
1. Install Ollama: [https://ollama.ai/](https://ollama.ai/)
2. Start Ollama: `ollama serve`
3. Pull models: `ollama pull llama3`
4. Test connection in AI Racers

## Testing Your Configuration

1. Enter your API key or endpoint
2. Click the "Test" button
3. Wait for validation results

**Success:** Shows connected status and available models
**Failure:** Shows error message with troubleshooting hints

## Troubleshooting

### Authentication Errors

**"Authentication failed. Please check your API key."**
- Verify you copied the entire API key
- Check for extra spaces or characters
- Ensure the API key is valid and not expired

### Network Errors

**"Network error: Unable to connect"**
- Check your internet connection
- Verify firewall settings
- For Ollama: Ensure `ollama serve` is running

### CORS Errors

**"CORS error: The API does not allow requests from this origin"**
- This typically occurs with local Ollama
- Configure Ollama to allow CORS from your app origin
- Or run the app on the same origin as Ollama

### Rate Limit Errors

**"Rate limit exceeded"**
- Wait the suggested time before retrying
- For xAI: Max 5 requests per minute
- For Gemini free tier: Max 60 requests per hour

### Ollama-Specific Issues

**"Unable to connect to Ollama"**
1. Check if Ollama is running: `ollama list`
2. Start Ollama: `ollama serve`
3. Verify endpoint: default is `http://localhost:11434`

**"Ollama is running but no models are installed"**
1. Pull a model: `ollama pull llama3`
2. List models: `ollama list`
3. Test again in AI Racers

## Security Notes

- API keys are stored locally in your browser's IndexedDB
- Keys are never sent to any server except the provider's API
- Use masked display to prevent shoulder surfing
- Consider using read-only or limited-scope API keys when possible

## Data Persistence

- Configurations are automatically saved to IndexedDB
- Data persists across page reloads and browser restarts
- Clearing browser data will remove saved configurations

## Tips

1. **Test before racing**: Always test your configuration before starting a race
2. **Multiple models**: Configure multiple providers to compare different models
3. **Local first**: Use Ollama for free, unlimited local testing
4. **API costs**: Be aware of API costs when using cloud providers
5. **Rate limits**: Respect rate limits to avoid being blocked
