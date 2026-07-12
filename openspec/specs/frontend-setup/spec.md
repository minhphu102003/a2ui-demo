# Frontend Setup Specification

## Purpose
Project configuration and dependencies for the Next.js frontend.

## Requirements

### Requirement: Node.js Version
The system SHALL use Node.js 18+ and Next.js 15+.

#### Scenario: Version compatibility
- GIVEN a developer clones the repository
- WHEN they check the Node.js version requirement
- THEN the project works with Node.js 18 or higher

### Requirement: Dependencies
The system SHALL include all required dependencies in `package.json`.

#### Scenario: Install dependencies
- GIVEN a fresh clone of the repository
- WHEN the developer runs `npm install` in the frontend directory
- THEN all dependencies are installed successfully
- AND no version conflicts occur

### Requirement: TypeScript
The system SHALL use TypeScript for type safety.

#### Scenario: Type checking
- GIVEN the project is set up
- WHEN `npm run typecheck` is run
- THEN no type errors are found

### Requirement: Tailwind CSS
The system SHALL use Tailwind CSS 4 for styling.

#### Scenario: CSS classes work
- GIVEN Tailwind is configured
- WHEN components use utility classes
- THEN styles are applied correctly

### Requirement: Environment Variables
The system SHALL use `.env.local` for frontend configuration.

#### Scenario: Backend URL
- GIVEN the `.env.local` file exists
- WHEN `NEXT_PUBLIC_BACKEND_URL` is set
- THEN the frontend uses this URL for API calls
- AND defaults to `http://localhost:8000` if not set
