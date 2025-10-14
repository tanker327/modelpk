# Capability: Model Selection

## ADDED Requirements

### Requirement: Display All Available Models

The application MUST display all models discovered during provider testing without truncation.

**Rationale**: Users need to see the complete list of available models to make informed selection decisions.

#### Scenario: User tests provider with many models

**Given** a provider test returns 50 models
**When** the test completes successfully
**Then** all 50 models SHALL be displayed in the UI
**And** no "+N more" truncation message SHALL appear

#### Scenario: User tests provider with few models

**Given** a provider test returns 3 models
**When** the test completes successfully
**Then** all 3 models SHALL be displayed in the UI

---

### Requirement: Toggle Model Selection State

The application MUST allow users to select and deselect individual models by clicking on them.

**Rationale**: Users need a simple, direct way to choose which models they want available for racing.

#### Scenario: User selects an unselected model

**Given** a model "gpt-4o" is displayed and unselected
**When** the user clicks on the "gpt-4o" model tag
**Then** the model SHALL change to selected state
**And** the model's visual appearance SHALL change to indicate selection

#### Scenario: User deselects a selected model

**Given** a model "gpt-4o" is displayed and selected
**When** the user clicks on the "gpt-4o" model tag
**Then** the model SHALL change to unselected state
**And** the model's visual appearance SHALL change to indicate deselection

#### Scenario: User toggles multiple models

**Given** models "gpt-4o", "gpt-4-turbo", and "gpt-3.5-turbo" are displayed
**When** the user clicks "gpt-4o" and then "gpt-4-turbo"
**Then** both models SHALL be in selected state
**And** "gpt-3.5-turbo" SHALL remain unselected

---

### Requirement: Visual Distinction for Selected Models

The application MUST provide clear visual feedback to distinguish selected models from unselected models.

**Rationale**: Users need immediate visual confirmation of which models are selected.

#### Scenario: Selected model has distinct appearance

**Given** a model is in selected state
**Then** the model tag SHALL have a distinct background color (e.g., blue)
**And** the model tag SHALL have contrasting text color for readability
**And** the visual distinction SHALL be immediately apparent to the user

#### Scenario: Unselected model has neutral appearance

**Given** a model is in unselected state
**Then** the model tag SHALL have a neutral background color (e.g., light gray)
**And** the appearance SHALL clearly differ from selected models

#### Scenario: Hover state provides feedback

**Given** a model tag is displayed
**When** the user hovers over the tag
**Then** the tag SHALL display a hover effect
**And** the cursor SHALL change to indicate clickability

---

### Requirement: Persist Selected Models in IndexedDB

The application MUST save selected models to IndexedDB whenever the selection state changes.

**Rationale**: Model selections must persist across browser sessions to avoid reconfiguration.

#### Scenario: Model selection triggers save

**Given** a user has configured a provider with API credentials
**When** the user selects a model "gpt-4o"
**Then** the application SHALL save the selected models list to IndexedDB
**And** the save operation SHALL complete without user intervention

#### Scenario: Model deselection triggers save

**Given** a user has previously selected "gpt-4o" and "gpt-4-turbo"
**When** the user deselects "gpt-4-turbo"
**Then** the application SHALL update the selected models list in IndexedDB
**And** only "gpt-4o" SHALL remain in the persisted list

#### Scenario: Multiple rapid selections are saved

**Given** a user quickly selects three models in succession
**When** each model is clicked
**Then** the application SHALL save the updated list after each click
**And** the final persisted state SHALL reflect all three selections

---

### Requirement: Restore Selected Models on Page Load

The application MUST restore previously selected models from IndexedDB when the page loads.

**Rationale**: Users expect their selections to persist across sessions.

#### Scenario: Page reload restores selections

**Given** a user has selected models "gpt-4o" and "gpt-4-turbo"
**And** the selections were saved to IndexedDB
**When** the user refreshes the page
**Then** the application SHALL load the saved configurations
**And** "gpt-4o" and "gpt-4-turbo" SHALL display as selected
**And** all other models SHALL display as unselected

#### Scenario: New browser session restores selections

**Given** a user has selected models and closed the browser
**When** the user opens the browser and navigates to the config page
**Then** the previously selected models SHALL be restored
**And** the visual state SHALL match the persisted state

#### Scenario: Provider with no saved selections shows all unselected

**Given** a provider has been tested but no models have been selected
**When** the page loads
**Then** all discovered models SHALL display as unselected
**And** no models SHALL be erroneously shown as selected

---

### Requirement: Schema Supports Selected Models Field

The provider configuration data schema MUST include a field to store selected model IDs.

**Rationale**: Data model must support the feature at the persistence layer.

#### Scenario: Configuration includes selected models field

**Given** a provider configuration is created
**Then** the configuration MUST include a `selectedModels` field
**And** the field SHALL be an array of strings
**And** the field SHALL default to an empty array if not provided

#### Scenario: Selected models are validated

**Given** a configuration is loaded from storage
**When** the `selectedModels` field is present
**Then** the application SHALL validate it as an array of strings
**And** invalid data SHALL be rejected with a clear error message

---

## MODIFIED Requirements

None. This capability adds new functionality without modifying existing requirements.

---

## REMOVED Requirements

None. This capability does not deprecate any existing functionality.
