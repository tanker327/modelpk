# UI Components Specification

## ADDED Requirements

### Requirement: Tailwind CSS Integration
The application SHALL use Tailwind CSS for styling.

#### Scenario: Setup Tailwind CSS
- **WHEN** the application is built
- **THEN** Tailwind CSS SHALL be properly configured and integrated
- **AND** utility classes SHALL be available for use in components
- **AND** the CSS bundle SHALL include only used utility classes (purged)

### Requirement: shadcn/ui Integration
The application SHALL use shadcn/ui as the component library.

#### Scenario: Install shadcn/ui components
- **WHEN** a component is needed
- **THEN** the component SHALL be installed from shadcn/ui
- **AND** the component SHALL be customizable through Tailwind classes
- **AND** components SHALL be located in the components/ui directory

### Requirement: Prompt Input Component
The application SHALL provide a reusable prompt input component.

#### Scenario: Render prompt input
- **WHEN** the prompt input component is rendered
- **THEN** it SHALL display a textarea for multi-line input
- **AND** it SHALL support placeholder text
- **AND** it SHALL handle user input and update state
- **AND** it SHALL be styled using Tailwind CSS

### Requirement: Model Selector Component
The application SHALL provide a model selection component.

#### Scenario: Display available models
- **WHEN** the model selector is rendered
- **THEN** it SHALL display a list of available models
- **AND** it SHALL indicate which models are currently selected
- **AND** it SHALL allow multiple model selection
- **AND** it SHALL use shadcn/ui components (e.g., Checkbox, Card)

### Requirement: Comparison Results Component
The application SHALL provide a component to display model comparison results.

#### Scenario: Display side-by-side results
- **WHEN** model outputs are available
- **THEN** results SHALL be displayed in a grid or flex layout
- **AND** each result SHALL be in a separate card/panel
- **AND** each panel SHALL show the model name as a header
- **AND** each panel SHALL show loading, success, or error state appropriately

#### Scenario: Responsive layout
- **WHEN** the viewport size changes
- **THEN** the comparison layout SHALL adapt responsively
- **AND** panels SHALL stack vertically on smaller screens
- **AND** panels SHALL display side-by-side on larger screens

### Requirement: Component Accessibility
The application components SHALL follow accessibility best practices.

#### Scenario: Keyboard navigation
- **WHEN** a user navigates using keyboard
- **THEN** all interactive elements SHALL be keyboard accessible
- **AND** focus states SHALL be clearly visible
- **AND** tab order SHALL be logical

#### Scenario: Screen reader support
- **WHEN** a screen reader is used
- **THEN** components SHALL have appropriate ARIA labels
- **AND** dynamic content updates SHALL be announced
- **AND** semantic HTML SHALL be used where appropriate
