# Delta for Backend Setup

## ADDED Requirements

### Requirement: Python Version
The system SHALL use Python 3.12 or higher.

#### Scenario: Version check
- GIVEN a developer clones the repository
- WHEN they check the Python version requirement
- THEN `pyproject.toml` specifies `requires-python = ">=3.12"`

### Requirement: Dependencies
The system SHALL include all required dependencies in `pyproject.toml`.

#### Scenario: Install dependencies
- GIVEN a fresh clone of the repository
- WHEN the developer runs `uv sync` in the backend directory
- THEN all dependencies are installed successfully
- AND no version conflicts occur

### Requirement: Environment Variables
The system SHALL use `.env` file for sensitive configuration.

#### Scenario: Missing API key
- GIVEN the `.env` file has no `OPENAI_API_KEY`
- WHEN the server starts
- THEN an appropriate error is logged

### Requirement: Package Manager
The system SHALL use `uv` for Python package management.

#### Scenario: Sync packages
- GIVEN dependencies are defined in `pyproject.toml`
- WHEN the developer runs `uv sync`
- THEN a virtual environment is created
- AND all packages are installed
