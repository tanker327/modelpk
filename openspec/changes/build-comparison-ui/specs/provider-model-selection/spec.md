# Capability: Provider and Model Selection

## ADDED Requirements

### Requirement: Display Available Providers

The application MUST display all configured providers that have API keys saved.

**Rationale**: Users can only compare models from providers they've configured.

#### Scenario: User has configured multiple providers

**Given** the user has configured OpenAI, Anthropic, and Gemini with API keys
**When** the user navigates to the comparison page
**Then** the application SHALL display checkboxes for OpenAI, Anthropic, and Gemini
**And** each provider SHALL be selectable

#### Scenario: User has not configured any providers

**Given** the user has not configured any providers with API keys
**When** the user navigates to the comparison page
**Then** the application SHALL display a message directing the user to the config page
**And** the application SHALL provide a link to the config page

---

### Requirement: Select Provider for Comparison

The application MUST allow users to select one or more providers for comparison.

**Rationale**: Users need to choose which providers to include in the comparison.

#### Scenario: User selects a provider

**Given** OpenAI is available for selection
**When** the user checks the OpenAI checkbox
**Then** the application SHALL mark OpenAI as selected
**And** the application SHALL display model selection options for OpenAI

#### Scenario: User deselects a provider

**Given** OpenAI is currently selected
**When** the user unchecks the OpenAI checkbox
**Then** the application SHALL remove OpenAI from the selection
**And** the application SHALL hide model selection options for OpenAI
**And** the application SHALL clear any selected models for OpenAI

---

### Requirement: Display Available Models Per Provider

The application MUST display models that were previously selected for each provider in the config page.

**Rationale**: Only models marked as "selected" in configuration should be available for comparison.

#### Scenario: User selects provider with selected models

**Given** the user has selected "gpt-4o" and "gpt-4-turbo" for OpenAI in config
**When** the user checks the OpenAI checkbox on the comparison page
**Then** the application SHALL display a dropdown with "gpt-4o" and "gpt-4-turbo"

#### Scenario: User selects provider with no selected models

**Given** the user has not selected any models for Gemini in config
**When** the user checks the Gemini checkbox on the comparison page
**Then** the application SHALL display a message "No models selected for this provider"
**And** the application SHALL provide a link to configure models

---

### Requirement: Select Models for Comparison

The application MUST allow users to select one or more models per provider for comparison.

**Rationale**: Users want to compare specific models, not all available models.

#### Scenario: User selects a single model

**Given** OpenAI is selected with available models "gpt-4o" and "gpt-4-turbo"
**When** the user selects "gpt-4o" from the dropdown
**Then** the application SHALL add "OpenAI / gpt-4o" to the comparison list

#### Scenario: User selects multiple models from same provider

**Given** OpenAI is selected with available models "gpt-4o" and "gpt-4-turbo"
**When** the user selects both "gpt-4o" and "gpt-4-turbo"
**Then** the application SHALL add both "OpenAI / gpt-4o" and "OpenAI / gpt-4-turbo" to the comparison list

#### Scenario: User removes a model from selection

**Given** the user has selected "OpenAI / gpt-4o" for comparison
**When** the user deselects "gpt-4o" from the dropdown
**Then** the application SHALL remove "OpenAI / gpt-4o" from the comparison list

---

### Requirement: Display Selected Combinations

The application MUST display a summary of all selected provider/model combinations.

**Rationale**: Users need to see which combinations will be compared before submitting.

#### Scenario: User selects multiple combinations

**Given** the user has selected:
  - OpenAI / gpt-4o
  - Anthropic / claude-3.5-sonnet
  - Gemini / gemini-1.5-pro
**When** viewing the comparison page
**Then** the application SHALL display all three combinations in a visible list
**And** each combination SHALL show provider name and model name

---

## MODIFIED Requirements

None. This is new functionality.

---

## REMOVED Requirements

None. This is new functionality.
