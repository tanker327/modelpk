# Capability: API Integration

## ADDED Requirements

### Requirement: Send Parallel API Requests

The application MUST send API requests to all selected provider/model combinations in parallel.

**Rationale**: Parallel requests provide faster results and true "racing" comparison.

#### Scenario: Multiple providers selected

**Given** the user has selected OpenAI / gpt-4o, Anthropic / claude-3.5-sonnet, and Gemini / gemini-1.5-pro
**When** the user clicks Submit
**Then** the application SHALL send all three API requests simultaneously
**And** each request SHALL be tracked independently

---

### Requirement: Track Request Timing

The application MUST record start time, end time, and duration for each API request.

**Rationale**: Timing information is a key metric for comparing model performance.

#### Scenario: Successful API request

**Given** an API request is sent to OpenAI
**When** the request completes successfully
**Then** the application SHALL record the duration in milliseconds
**And** the duration SHALL be displayed to the user

#### Scenario: Failed API request

**Given** an API request fails
**When** the error is received
**Then** the application SHALL still record the duration until failure
**And** the duration SHALL be displayed alongside the error

---

### Requirement: Handle Partial Success

The application MUST handle cases where some API requests succeed and others fail.

**Rationale**: One provider failing should not prevent display of other successful responses.

#### Scenario: Mixed success and failure

**Given** the user has selected OpenAI, Anthropic, and Gemini
**When** OpenAI succeeds, Anthropic fails, and Gemini succeeds
**Then** the application SHALL display the OpenAI response
**And** the application SHALL display the Gemini response
**And** the application SHALL display an error message for Anthropic
**And** all three panels SHALL be visible

---

### Requirement: Provider-Specific API Implementation

The application MUST implement API calls for each supported provider according to their specifications.

**Rationale**: Each provider has different API formats and requirements.

#### Scenario: OpenAI API call

**Given** the user selects OpenAI / gpt-4o
**When** the request is sent
**Then** the application SHALL use the OpenAI chat completions format
**And** the application SHALL include the model, messages array, and API key

#### Scenario: Anthropic API call

**Given** the user selects Anthropic / claude-3.5-sonnet
**When** the request is sent
**Then** the application SHALL use the Anthropic messages format
**And** the application SHALL include system prompt separately from user message
**And** the application SHALL include required max_tokens parameter

#### Scenario: Gemini API call

**Given** the user selects Gemini / gemini-1.5-pro
**When** the request is sent
**Then** the application SHALL use the Gemini generateContent format
**And** the application SHALL include API key in query parameter

---

### Requirement: Handle CORS Limitations

The application MUST handle CORS errors gracefully and inform users of limitations.

**Rationale**: Browser-based API calls may be blocked by CORS policies.

#### Scenario: CORS error occurs

**Given** an API request is blocked by CORS
**When** the error is received
**Then** the application SHALL display a clear error message about CORS limitations
**And** the application SHALL not crash or hang

---

## MODIFIED Requirements

None. This is new functionality.

---

## REMOVED Requirements

None. This is new functionality.
