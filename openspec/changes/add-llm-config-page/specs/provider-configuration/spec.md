# Spec: Provider Configuration

## ADDED Requirements

### Requirement: Provider configuration page must be accessible via /config route

The application SHALL provide a dedicated page accessible at the `/config` route where users can manage their LLM provider configurations.

#### Scenario: User navigates to configuration page

**Given** the application is running
**When** the user navigates to `/config`
**Then** the provider configuration page is displayed
**And** the page shows configuration forms for all supported providers

---

### Requirement: System must support configuration for five LLM providers

The application MUST support configuration for five LLM providers: OpenAI, Gemini, Anthropic, xAI, and Ollama.

#### Scenario: Configuration page displays all provider cards

**Given** the user is on the `/config` page
**Then** configuration cards for OpenAI, Gemini, Anthropic, xAI, and Ollama are displayed
**And** each card shows the provider name and logo/icon
**And** each card has input fields appropriate to that provider

#### Scenario: OpenAI provider requires API key input

**Given** the user views the OpenAI configuration card
**Then** an API key input field is displayed
**And** an optional base URL input field is available
**And** the default base URL is `https://api.openai.com/v1`

#### Scenario: Gemini provider requires API key input

**Given** the user views the Gemini configuration card
**Then** an API key input field is displayed
**And** an optional base URL input field is available
**And** the default base URL is `https://generativelanguage.googleapis.com/v1beta`

#### Scenario: Anthropic provider requires API key input

**Given** the user views the Anthropic configuration card
**Then** an API key input field is displayed
**And** an optional base URL input field is available
**And** the default base URL is `https://api.anthropic.com/v1`

#### Scenario: xAI provider requires API key input

**Given** the user views the xAI configuration card
**Then** an API key input field is displayed
**And** an optional base URL input field is available
**And** the default base URL is `https://api.grok.xai.com/v1`

#### Scenario: Ollama provider requires endpoint URL input

**Given** the user views the Ollama configuration card
**Then** an endpoint URL input field is displayed
**And** the default endpoint is `http://localhost:11434`
**And** no API key field is shown (Ollama is local and doesn't require authentication)

---

### Requirement: API keys must be displayed in masked format for security

The application MUST display API keys in a masked format showing only the last 4-6 characters to prevent shoulder surfing and accidental exposure.

#### Scenario: Saved API key is displayed in masked format

**Given** the user has saved an API key for a provider
**When** the configuration page loads
**Then** the API key is displayed in masked format showing only the last 4-6 characters
**And** the beginning of the key is replaced with asterisks (e.g., `************sk-abc123`)

#### Scenario: User can toggle API key visibility

**Given** the user views a masked API key
**When** the user clicks the show/hide toggle button
**Then** the full API key is revealed
**And** clicking the toggle again re-masks the key

---

### Requirement: Configuration forms must validate user input

Configuration forms MUST validate user input to prevent invalid configurations from being saved.

#### Scenario: Empty API key is rejected

**Given** the user is configuring a cloud provider (OpenAI, Gemini, Anthropic, or xAI)
**When** the user attempts to save without entering an API key
**Then** a validation error is displayed
**And** the configuration is not saved

#### Scenario: Invalid URL format is rejected

**Given** the user enters a custom base URL or Ollama endpoint
**When** the URL is not in valid format (e.g., missing protocol)
**Then** a validation error is displayed
**And** the configuration is not saved

#### Scenario: Valid configuration is accepted

**Given** the user enters a valid API key for a cloud provider
**When** the user saves the configuration
**Then** no validation errors are displayed
**And** the configuration is saved successfully

---

### Requirement: Each provider configuration can be enabled or disabled

The application SHALL allow users to toggle providers on/off without deleting their saved configurations.

#### Scenario: User disables a configured provider

**Given** a provider has a saved configuration
**When** the user toggles the provider to disabled
**Then** the provider is marked as disabled
**And** the configuration is retained but not used in the application

#### Scenario: User re-enables a disabled provider

**Given** a provider is disabled
**When** the user toggles the provider to enabled
**Then** the provider is marked as enabled
**And** the saved configuration becomes active
