# AI Racers

A React-based web application for comparing outputs from different AI models using the same prompt.

## Project Status

All essential libraries installed and configured! Ready to build features.

## Tech Stack

### Core
- **React 18.3** - UI framework
- **TypeScript 5.6** - Type safety
- **Vite 6** - Build tool and dev server

### State & Data
- **Zedux 1.3** - Atomic state management
- **Zod 4.1** - Runtime schema validation

### Styling & Components
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library
- **Radix UI** - Unstyled component primitives

### Testing
- **Jest 30** - Test framework
- **Testing Library 16** - React testing utilities

## Development

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
ai-racers/
├── src/
│   ├── components/
│   │   └── ui/          # shadcn/ui components
│   ├── lib/             # Utility functions
│   ├── schemas/         # Zod schemas
│   ├── state/
│   │   ├── atoms/       # Zedux atoms
│   │   └── ecosystem.ts # Zedux configuration
│   ├── App.tsx          # Main application component
│   ├── App.test.tsx     # App tests
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles with Tailwind
├── public/              # Static assets
├── dist/                # Production build output
├── openspec/            # OpenSpec documentation
├── jest.config.js       # Jest configuration
├── tailwind.config.js   # Tailwind configuration
├── vite.config.ts       # Vite configuration
└── tsconfig.json        # TypeScript configuration
```

## OpenSpec Workflow

This project follows the OpenSpec workflow for spec-driven development:

- **Proposals**: See `openspec/changes/` for active changes
- **Specs**: See `openspec/specs/` for current specifications

### Completed Changes

- `init-hello-world-app` - ✅ Basic React + TypeScript + Vite setup
- `setup-project-libraries` - ✅ All libraries installed and configured

## Library Examples

The App component (`src/App.tsx`) demonstrates all libraries working together:
- Tailwind CSS utility classes for styling
- shadcn/ui Button component
- Zedux atom for state management
- Zod schema for validation
- Jest tests in `src/App.test.tsx`

## Next Steps

Now that all libraries are configured, the next phase will implement:
- Prompt input interface
- Model selection UI
- Model comparison display
- Configuration management

## License

Private project
