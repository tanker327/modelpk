# Design Document: React Model Comparison Application

## Context

This is a greenfield React application designed to help developers and researchers compare outputs from multiple AI models using the same prompt. The application needs to be:
- Easy to set up and run locally
- Simple to extend with new models
- Fast and responsive
- Maintainable with type safety and tests

**Stakeholders**: Developers, AI researchers, and teams evaluating model performance

**Constraints**:
- Local-only (no backend in initial phase)
- Session-based storage (no persistence across sessions)
- Modern browser support only (ES2020+)

## Goals / Non-Goals

### Goals
- Provide a clean, intuitive UI for comparing AI model outputs
- Establish a solid foundation with TypeScript, testing, and modern tooling
- Use atomic state management for scalability
- Ensure accessibility and responsive design
- Support easy addition of new models in the future

### Non-Goals
- Backend API or server-side rendering (future phase)
- User authentication or multi-user support
- Permanent data persistence (localStorage/database)
- Integration with actual AI model APIs (initial phase focuses on UI/structure)

## Decisions

### Decision 1: Vite as Build Tool
**Choice**: Use Vite instead of Create React App or Next.js

**Rationale**:
- Faster dev server startup and HMR than CRA
- Simpler than Next.js for a client-only app
- Modern ESM-based architecture
- Excellent TypeScript support out of the box
- Growing ecosystem and community adoption

**Alternatives Considered**:
- Create React App: Slower, heavier, less modern
- Next.js: Overkill for client-only app, adds unnecessary complexity
- Webpack from scratch: Too much configuration overhead

### Decision 2: Zedux for State Management
**Choice**: Use Zedux instead of Redux, Zustand, or Context API

**Rationale**:
- Atomic state management pattern (similar to Recoil/Jotai but more mature)
- Excellent TypeScript support
- Composable atoms for granular state updates
- Built-in async support for future API integrations
- Less boilerplate than Redux

**Alternatives Considered**:
- Redux Toolkit: More boilerplate, heavier
- Zustand: Simpler but less structured for complex state
- React Context: Not suitable for frequent updates, performance concerns
- Recoil: Experimental status, less stable

### Decision 3: Tailwind CSS + shadcn/ui
**Choice**: Use Tailwind for styling with shadcn/ui components

**Rationale**:
- Tailwind: Utility-first approach, excellent DX, small production bundle
- shadcn/ui: Copy-paste components (not a dependency), full customization
- Great accessibility out of the box with shadcn/ui
- Consistent design system with minimal setup

**Alternatives Considered**:
- Material-UI: Heavier, harder to customize, larger bundle
- Ant Design: Similar issues to MUI
- Chakra UI: Good but more opinionated than Tailwind + shadcn
- Plain CSS/Modules: More manual work, less consistency

### Decision 4: Zod for Schema Validation
**Choice**: Use Zod for runtime validation of configuration

**Rationale**:
- Type-safe schema validation at runtime
- Excellent TypeScript inference
- Small bundle size
- Simple API
- Catches bugs from invalid sessionStorage data

**Alternatives Considered**:
- Yup: Less type-safe, older API
- Joi: Too heavy for client-side
- Manual validation: Error-prone, no type inference

### Decision 5: Jest + Testing Library
**Choice**: Use Jest with React Testing Library

**Rationale**:
- Industry standard for React testing
- Encourages testing user behavior over implementation
- Excellent TypeScript support
- Rich ecosystem of plugins and matchers

**Alternatives Considered**:
- Vitest: Newer, but Jest is more mature for React
- Cypress Component Testing: Heavier, better for E2E

### Decision 6: Session Storage for Configuration
**Choice**: Use sessionStorage instead of localStorage

**Rationale**:
- Configuration is session-specific (intentional)
- Prevents stale data across sessions
- Simpler privacy model
- User can start fresh each session

**Trade-offs**:
- Settings don't persist across sessions (by design)
- If users want persistence, can add localStorage in future phase

## Architecture Overview

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── PromptInput/     # Prompt input component
│   ├── ModelSelector/   # Model selection component
│   ├── ModelOutput/     # Individual model output panel
│   └── ComparisonGrid/  # Layout for comparison results
├── state/
│   ├── atoms/           # Zedux atoms
│   │   ├── promptAtom.ts
│   │   ├── modelsAtom.ts
│   │   └── outputsAtom.ts
│   └── ecosystem.ts     # Zedux ecosystem setup
├── config/
│   ├── schema.ts        # Zod schemas
│   ├── defaults.ts      # Default configuration
│   └── storage.ts       # sessionStorage utilities
├── types/
│   └── index.ts         # Shared TypeScript types
├── App.tsx              # Main application component
└── main.tsx             # Application entry point
```

## Data Flow

1. User enters prompt → updates `promptAtom`
2. User selects models → updates `modelsAtom`
3. Components subscribe to atoms via Zedux hooks
4. Configuration changes → validated via Zod → saved to sessionStorage
5. On app load → load from sessionStorage → validate → hydrate atoms

## Risks / Trade-offs

### Risk: Zedux Learning Curve
**Mitigation**:
- Provide clear examples in code
- Keep atom structure simple initially
- Document patterns in README

### Risk: sessionStorage Limitations
**Impact**: Data lost when session ends
**Mitigation**:
- Clear user expectations in UI
- Easy to add localStorage later if needed

### Risk: No API Integration Yet
**Impact**: Can't test with real models initially
**Mitigation**:
- Structure state to accommodate async operations
- Mock data for testing
- API integration is straightforward to add later

### Trade-off: Client-side Only
**Pros**: Simple deployment, no backend needed
**Cons**: Can't share results, no server-side processing
**Decision**: Acceptable for initial phase, backend can be added later

## Migration Plan

N/A - This is a new project with no existing system to migrate from.

## Open Questions

1. **Model Configuration**: Should model-specific parameters (temperature, max tokens) be configurable in the initial version?
   - **Resolution**: Start simple with just model selection. Add parameters in future iteration if needed.

2. **Error Handling**: How should we handle model API errors in the UI?
   - **Resolution**: Display user-friendly error messages in the output panel. Log technical details to console for debugging.

3. **Comparison Features**: Should we include diff/highlighting features to compare outputs?
   - **Resolution**: Not in initial version. Focus on side-by-side display. Can add advanced comparison features later.

4. **Export Functionality**: Should users be able to export comparison results?
   - **Resolution**: Not in initial phase. Add if users request it.
