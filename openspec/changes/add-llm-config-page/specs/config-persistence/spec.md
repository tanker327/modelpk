# Spec: Configuration Persistence

## ADDED Requirements

### Requirement: Provider configurations must be persisted in browser IndexedDB

The application MUST persist provider configurations in browser IndexedDB so that configurations survive page refreshes and browser restarts.

#### Scenario: User saves provider configuration

**Given** the user has entered valid configuration for a provider
**When** the user saves or exits the input field
**Then** the configuration is saved to IndexedDB
**And** a success indicator is shown (e.g., checkmark or "Saved" message)

#### Scenario: Saved configuration is loaded on page visit

**Given** the user has previously saved configurations for one or more providers
**When** the user navigates to the `/config` page
**Then** all saved configurations are loaded from IndexedDB
**And** the configuration forms are pre-filled with saved values
**And** API keys are displayed in masked format

---

### Requirement: IndexedDB database must use consistent schema

The IndexedDB database MUST use a consistent, well-defined schema to ensure data integrity and enable future migrations.

#### Scenario: Database is created with correct schema on first use

**Given** the user visits the application for the first time
**When** the application initializes
**Then** an IndexedDB database named `modelpk-config` is created
**And** a `providers` object store is created with `id` as the key path
**And** the database version is set to 1

#### Scenario: Provider configuration objects have required fields

**Given** a provider configuration is stored in IndexedDB
**Then** the object contains an `id` field (provider identifier)
**And** the object contains a `name` field (provider display name)
**And** the object contains an `enabled` boolean field
**And** the object contains a `config` object with provider-specific settings
**And** the `config` object includes `apiKey` and/or `endpoint` as appropriate

---

### Requirement: Configuration updates must be saved automatically

The application MUST automatically save configuration updates so that users do not need to manually save after each change.

#### Scenario: API key change triggers auto-save

**Given** the user is editing an API key field
**When** the user finishes typing (input blur or debounced)
**Then** the configuration is automatically saved to IndexedDB
**And** a subtle save indicator is shown

#### Scenario: Enable/disable toggle triggers auto-save

**Given** the user toggles a provider's enabled/disabled state
**When** the toggle changes
**Then** the new state is immediately saved to IndexedDB
**And** the UI reflects the saved state

---

### Requirement: Configuration deletion must be supported

The application MUST support configuration deletion, allowing users to remove saved configurations.

#### Scenario: User clears a provider configuration

**Given** a provider has a saved configuration
**When** the user clicks "Clear" or "Delete" for that provider
**Then** a confirmation dialog is shown
**And** upon confirmation, the configuration is removed from IndexedDB
**And** the form fields are reset to empty/default values

#### Scenario: Clearing configuration does not affect other providers

**Given** multiple providers have saved configurations
**When** the user clears one provider's configuration
**Then** only that provider's data is removed from IndexedDB
**And** other providers' configurations remain intact

---

### Requirement: IndexedDB operations must handle errors gracefully

IndexedDB operations MUST handle errors gracefully to ensure that storage failures do not crash the application.

#### Scenario: IndexedDB write failure shows error message

**Given** the user attempts to save a configuration
**And** IndexedDB write fails (e.g., quota exceeded, permissions issue)
**When** the error occurs
**Then** an error message is displayed to the user
**And** the error message suggests potential solutions (e.g., clear browser data, check storage quota)

#### Scenario: IndexedDB read failure uses empty defaults

**Given** the user opens the configuration page
**And** IndexedDB read fails (e.g., corrupted database)
**When** the page loads
**Then** the application logs the error
**And** empty/default configurations are shown
**And** a warning message indicates configurations could not be loaded

---

### Requirement: Sensitive data must not be logged or exposed unnecessarily

The application MUST NOT log or unnecessarily expose sensitive data such as API keys to protect them from accidental exposure in logs or debugging output.

#### Scenario: API keys are not logged to console

**Given** the application saves or loads configurations
**When** logging occurs for debugging
**Then** API keys are redacted from console logs
**And** only masked versions or placeholders are logged (e.g., `apiKey: '****'`)

#### Scenario: IndexedDB storage is origin-scoped

**Given** the application uses IndexedDB
**Then** the database is scoped to the application's origin
**And** other origins cannot access the stored configurations
**And** the application only runs over HTTPS in production (to prevent interception)

---

### Requirement: Configuration export and import must be supported for backup

The application MUST support configuration export and import to allow users to back up and restore their configurations.

#### Scenario: User exports all configurations

**Given** the user has saved configurations for multiple providers
**When** the user clicks "Export Configurations"
**Then** a JSON file is downloaded containing all configurations
**And** sensitive data (API keys) are included in the export
**And** the filename includes a timestamp (e.g., `modelpk-config-2025-10-14.json`)

#### Scenario: User imports configurations from backup

**Given** the user has an exported configuration JSON file
**When** the user clicks "Import Configurations" and selects the file
**Then** the configurations are validated against the schema
**And** valid configurations are loaded into IndexedDB
**And** the configuration forms are updated with imported values
**And** invalid configurations are rejected with an error message

#### Scenario: Import merges with existing configurations

**Given** the user has some existing saved configurations
**When** the user imports a configuration file
**Then** imported configurations overwrite existing ones with the same provider ID
**And** providers not in the import file retain their existing configurations
**And** the user is shown a summary of what was imported/updated
