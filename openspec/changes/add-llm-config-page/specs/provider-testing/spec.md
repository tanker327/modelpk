# Spec: Provider Testing

## ADDED Requirements

### Requirement: Each provider configuration must have a test connection button

Each provider configuration MUST include a test connection button that allows users to verify their API configurations before using them.

#### Scenario: Test button is displayed for each provider

**Given** the user is on the `/config` page
**Then** each provider card displays a "Test" or "Test Connection" button
**And** the button is enabled when required fields are filled
**And** the button is disabled when required fields are empty

---

### Requirement: Test button must validate API connection and discover available models

The test button MUST validate the API connection and discover available models, confirming both authentication and providing useful information to the user.

#### Scenario: User tests OpenAI configuration successfully

**Given** the user has entered a valid OpenAI API key
**When** the user clicks the "Test" button for OpenAI
**Then** a loading state is shown during the test
**And** the system calls the OpenAI `/v1/models` endpoint
**And** a success message is displayed
**And** the list of available models is shown (e.g., gpt-4o, gpt-4-turbo, gpt-3.5-turbo)

#### Scenario: User tests Gemini configuration successfully

**Given** the user has entered a valid Gemini API key
**When** the user clicks the "Test" button for Gemini
**Then** a loading state is shown during the test
**And** the system calls the Gemini `/models` endpoint with the API key
**And** a success message is displayed
**And** the list of available models is shown (e.g., gemini-2.5-pro, gemini-2.5-flash)

#### Scenario: User tests Anthropic configuration successfully

**Given** the user has entered a valid Anthropic API key
**When** the user clicks the "Test" button for Anthropic
**Then** a loading state is shown during the test
**And** the system makes an authenticated request with required headers (x-api-key, anthropic-version, content-type)
**And** a success message is displayed
**And** the list of available models is shown (e.g., claude-3.5-sonnet, claude-3-opus)

#### Scenario: User tests xAI configuration successfully

**Given** the user has entered a valid xAI API key
**When** the user clicks the "Test" button for xAI
**Then** a loading state is shown during the test
**And** the system calls the xAI `/v1/models` endpoint
**And** a success message is displayed
**And** the list of available models is shown (e.g., grok-2, grok-2-vision)

#### Scenario: User tests Ollama configuration successfully

**Given** the user has entered a valid Ollama endpoint URL
**And** Ollama is running locally
**When** the user clicks the "Test" button for Ollama
**Then** a loading state is shown during the test
**And** the system calls the Ollama `/api/tags` endpoint
**And** a success message is displayed
**And** the list of locally available models is shown (e.g., llama3, mistral)

---

### Requirement: Test failures must display helpful error messages

The application MUST display clear and helpful error messages when tests fail to help users diagnose and fix configuration issues.

#### Scenario: Invalid API key produces authentication error

**Given** the user has entered an invalid API key for a cloud provider
**When** the user clicks the "Test" button
**Then** an error message indicates authentication failed
**And** the message suggests checking the API key
**And** no models are displayed

#### Scenario: Network error produces connection error

**Given** the user has a valid configuration
**And** there is a network connectivity issue
**When** the user clicks the "Test" button
**Then** an error message indicates a connection failure
**And** the message suggests checking network connectivity

#### Scenario: Ollama not running produces connection error

**Given** the user has configured Ollama endpoint
**And** Ollama is not running locally
**When** the user clicks the "Test" button
**Then** an error message indicates Ollama is not reachable
**And** the message suggests starting Ollama with `ollama serve`

#### Scenario: CORS error provides guidance

**Given** the user tests a provider that returns a CORS error
**When** the test fails with CORS
**Then** the error message explains CORS restrictions
**And** suggestions for resolution are provided (e.g., using a proxy or CORS browser extension for development)

#### Scenario: Rate limit error provides retry guidance

**Given** the user tests a provider
**And** the API returns a rate limit error (e.g., 429 status)
**When** the test completes
**Then** the error message indicates rate limiting
**And** the message suggests waiting before retrying
**And** the retry wait time is displayed if available in the response

---

### Requirement: Test results must be displayed in a user-friendly format

Test results MUST be displayed in a user-friendly format with model lists that are easy to read and understand.

#### Scenario: Available models are displayed as a formatted list

**Given** a successful test has returned available models
**Then** models are displayed in a list or grid format
**And** each model name is clearly readable
**And** the number of available models is shown (e.g., "5 models available")

#### Scenario: Large model lists are paginated or scrollable

**Given** a provider returns more than 10 models
**Then** the model list is scrollable or paginated
**And** all models are accessible without cluttering the UI

---

### Requirement: Test button must be debounced to prevent rapid API calls

The test button MUST be debounced to prevent users from accidentally triggering multiple simultaneous API tests.

#### Scenario: Rapid test button clicks are debounced

**Given** the user clicks the "Test" button
**When** the user clicks the button again within 1 second
**Then** the second click is ignored
**And** only one API request is made
**And** the button shows a loading state during the test

---

### Requirement: Test results must be cached with timestamp

The application MUST cache test results with timestamps to avoid unnecessary API calls, with a 5-minute time-to-live (TTL).

#### Scenario: Recent test results are displayed from cache

**Given** the user successfully tested a provider less than 5 minutes ago
**When** the user views the configuration page
**Then** the cached test results are displayed
**And** the timestamp of the last test is shown (e.g., "Tested 2 minutes ago")

#### Scenario: Stale cache is cleared on retest

**Given** cached test results exist for a provider
**When** the user clicks "Test" again
**Then** the cache is cleared
**And** a fresh API call is made
**And** new results replace the cached results
