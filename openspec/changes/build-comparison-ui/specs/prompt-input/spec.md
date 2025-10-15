# Capability: Prompt Input

## ADDED Requirements

### Requirement: Test Name Input

The application MUST provide an optional test name input field.

**Rationale**: Users may want to organize or identify their comparisons with descriptive names.

#### Scenario: User enters a test name

**Given** the comparison page is displayed
**When** the user enters "Creativity Test" in the test name field
**Then** the application SHALL store "Creativity Test" as the test name

#### Scenario: User submits without a test name

**Given** the test name field is empty
**When** the user submits the comparison
**Then** the application SHALL proceed without requiring a test name

---

### Requirement: System Prompt Input

The application MUST provide an optional system prompt input field.

**Rationale**: System prompts configure model behavior and are a key part of model comparison.

#### Scenario: User enters a system prompt

**Given** the comparison page is displayed
**When** the user enters "You are a helpful assistant" in the system prompt field
**Then** the application SHALL include this system prompt in API requests

#### Scenario: User submits without a system prompt

**Given** the system prompt field is empty
**When** the user submits the comparison
**Then** the application SHALL send requests without a system prompt

---

### Requirement: User Prompt Input

The application MUST provide a required user prompt input field.

**Rationale**: The user prompt is the core input that drives the comparison.

#### Scenario: User enters a user prompt

**Given** the comparison page is displayed
**When** the user enters "Explain quantum computing" in the user prompt field
**Then** the application SHALL store this as the user prompt

#### Scenario: User attempts to submit without a user prompt

**Given** the user prompt field is empty
**When** the user clicks the Submit button
**Then** the application SHALL display an error message "User prompt is required"
**And** the application SHALL not send any API requests

---

### Requirement: Reset Form Inputs

The application MUST provide a reset button that clears all input fields.

**Rationale**: Users need a quick way to start a new comparison from scratch.

#### Scenario: User clicks reset with filled fields

**Given** the user has entered:
  - Test name: "Test 1"
  - System prompt: "You are an expert"
  - User prompt: "Explain AI"
  - Selected OpenAI / gpt-4o
**When** the user clicks the Reset button
**Then** the application SHALL clear the test name field
**And** the application SHALL clear the system prompt field
**And** the application SHALL clear the user prompt field
**And** the application SHALL clear all provider/model selections
**And** the application SHALL clear any displayed results

#### Scenario: User clicks reset with empty fields

**Given** all fields are empty
**When** the user clicks the Reset button
**Then** the application SHALL remain in its current state
**And** no error SHALL be displayed

---

### Requirement: Preserve Inputs During API Calls

The application MUST preserve input field values while API requests are in progress.

**Rationale**: Users should be able to see what they submitted while results are loading.

#### Scenario: Inputs remain visible during submission

**Given** the user has submitted a comparison
**And** API requests are in progress
**When** viewing the comparison page
**Then** the test name SHALL still be displayed
**And** the system prompt SHALL still be displayed
**And** the user prompt SHALL still be displayed
**And** the selected provider/model combinations SHALL still be displayed

---

## MODIFIED Requirements

None. This is new functionality.

---

## REMOVED Requirements

None. This is new functionality.
