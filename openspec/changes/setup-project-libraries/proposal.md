# Proposal: Setup Project Libraries

## Why

Now that the basic React + TypeScript + Vite foundation is working, we need to install and configure all the essential libraries (Zedux, Tailwind CSS, shadcn/ui, Zod, Jest) before building features. This ensures the development environment is complete and validates that all libraries integrate correctly with each other.

## What Changes

- **NEW**: Install and configure Tailwind CSS for styling
- **NEW**: Install and setup shadcn/ui component library
- **NEW**: Install and configure Zedux for state management
- **NEW**: Install Zod for schema validation
- **NEW**: Install and configure Jest + Testing Library for testing
- **NEW**: Create minimal example/test for each library to validate integration
- **NEW**: Update build scripts and configuration files

## Impact

- **Affected specs**:
  - `tailwind-integration` (NEW) - Tailwind CSS setup and configuration
  - `shadcn-integration` (NEW) - shadcn/ui component library setup
  - `zedux-integration` (NEW) - Zedux state management setup
  - `zod-integration` (NEW) - Zod schema validation setup
  - `jest-integration` (NEW) - Jest testing framework setup

- **Affected code**:
  - Updated package.json with new dependencies
  - New tailwind.config.js and postcss.config.js
  - New components.json for shadcn/ui
  - New jest.config.js and test setup files
  - New src/lib/utils.ts for shadcn utilities
  - New example component using Tailwind
  - New example Zedux atom
  - New example Zod schema
  - New example Jest test

## Dependencies

- Tailwind CSS + PostCSS
- shadcn/ui (includes Radix UI primitives)
- Zedux
- Zod
- Jest + Testing Library + ts-jest

## Non-Goals (Out of Scope)

- Building actual model comparison features (next phase)
- Complex component implementations
- Full test coverage (just setup validation)
- API integrations
