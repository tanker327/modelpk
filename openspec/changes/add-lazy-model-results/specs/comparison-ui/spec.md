# Comparison UI Specification Delta

## ADDED Requirements

### Requirement: Lazy Model Result Addition
When results are already displayed and a user selects a new model, the system SHALL immediately add a result box for that model with a "pending" status, allowing the user to fetch the result on demand.

#### Scenario: User adds model after initial submission
- **GIVEN** comparison results are displayed for at least one model
- **WHEN** user selects a new model from the provider selection UI
- **THEN** a result box SHALL appear immediately with status "pending"
- **AND** the result box SHALL display a refresh button
- **AND** existing result boxes SHALL remain unchanged

#### Scenario: User fetches pending model result
- **GIVEN** a result box with "pending" status exists
- **WHEN** user clicks the refresh button on that result box
- **THEN** only that specific model's API request SHALL be triggered
- **AND** the result box status SHALL change to "loading"
- **AND** upon completion, the result box SHALL display the model's response
- **AND** other result boxes SHALL remain unchanged

#### Scenario: User removes model with pending result
- **GIVEN** a result box with "pending" status exists
- **WHEN** user deselects that model from the provider selection UI
- **THEN** the result box SHALL be removed
- **AND** other result boxes SHALL remain unchanged

### Requirement: Preserve Initial Submit Flow
The initial Submit button flow SHALL remain unchanged, fetching results for all selected models simultaneously.

#### Scenario: Initial submission with multiple models
- **GIVEN** no results are currently displayed
- **AND** user has selected multiple models
- **WHEN** user clicks the Submit button
- **THEN** all selected models SHALL be requested simultaneously
- **AND** result boxes SHALL appear for all models with "loading" status

### Requirement: Result State Persistence
Model selection changes SHALL not clear existing fetched results unless the model is deselected.

#### Scenario: Adding models preserves existing results
- **GIVEN** user has fetched results for Model A and Model B
- **WHEN** user selects Model C
- **THEN** results for Model A and Model B SHALL remain displayed
- **AND** a new pending result box SHALL appear for Model C

#### Scenario: Deselecting model removes its result
- **GIVEN** user has results displayed for Model A, Model B, and Model C
- **WHEN** user deselects Model B
- **THEN** Model B's result box SHALL be removed
- **AND** Model A and Model C result boxes SHALL remain unchanged
