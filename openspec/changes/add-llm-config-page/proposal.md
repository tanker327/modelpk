# Proposal: Add LLM Provider Configuration Page

## Summary

Add a `/config` page that allows users to configure multiple LLM API providers (OpenAI, Gemini, Anthropic, xAI, and Ollama), test their API connections, and persist configurations in browser IndexedDB.

## Context

The AI Racers application needs to support multiple LLM providers to enable flexible model comparisons. Users need a centralized interface to:

1. Configure API credentials for different providers
2. Test their API connections to verify configuration
3. Discover available models for each configured provider
4. Persist configurations locally in the browser

## Motivation

- **Multi-provider support**: Enable users to compare models across different AI providers
- **User control**: Allow users to manage their own API keys securely in their browser
- **Validation**: Provide immediate feedback on configuration correctness
- **Persistence**: Save configurations locally so users don't need to re-enter credentials

## Proposed Changes

This change introduces three main capabilities:

1. **Provider Configuration UI** - A dedicated `/config` page with forms to input API keys and endpoints for each provider
2. **Provider Testing** - Connection testing functionality that validates credentials and lists available models
3. **Configuration Persistence** - IndexedDB storage for saving and retrieving provider configurations

## Scope

**In Scope:**
- Configuration page UI at `/config` route
- Support for 5 providers: OpenAI, Gemini (Google), Anthropic, xAI, and Ollama
- API key/endpoint input forms for each provider
- Test connection button with success/failure feedback
- Display of available models after successful test
- IndexedDB persistence of all configurations
- Basic error handling and validation

**Out of Scope:**
- Actual LLM API integration for model inference (will be addressed in future changes)
- User authentication or cloud-based configuration sync
- API usage tracking or billing information
- Advanced security features like encryption (browser storage is already isolated per origin)
- Configuration export/import functionality

## Dependencies

- React Router (or equivalent routing solution) for `/config` route
- IndexedDB wrapper library (e.g., idb, localforage) for storage
- HTTP client for API testing calls

## Risks and Mitigations

**Risk**: API keys stored in IndexedDB could be accessed by XSS attacks
**Mitigation**: Follow React security best practices, use Content Security Policy headers, sanitize all user inputs. Document that users should use read-only or limited-scope API keys when possible.

**Risk**: Different providers may have different rate limits that could be hit during testing
**Mitigation**: Implement basic rate limiting/debouncing on test button clicks, show appropriate error messages for rate limit responses.

**Risk**: CORS issues when testing API endpoints from browser
**Mitigation**: Document CORS limitations, consider proxy endpoints if needed in future, or use appropriate CORS headers for Ollama local setup.

## Alternatives Considered

1. **Backend-based configuration storage**: Rejected because it requires authentication infrastructure and server costs. Browser-based storage is simpler for initial version.

2. **Single unified API key input**: Rejected because different providers have different authentication mechanisms and configuration requirements.

3. **Auto-discovery of models without explicit test**: Rejected because it would require storing potentially invalid credentials and making background requests.

## Timeline

- Estimated effort: 2-3 days
- No hard deadline, this is a foundational feature for the application
