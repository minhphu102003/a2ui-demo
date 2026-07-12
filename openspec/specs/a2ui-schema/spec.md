# A2UI Schema Specification

## Purpose
A2UI schema management and parsing for LLM output.

## Requirements

### Requirement: Schema Manager
The system SHALL provide an `A2UISchemaManager` class that wraps the `a2ui-agent-sdk`.

#### Scenario: Generate system prompt
- GIVEN the schema manager is initialized
- WHEN `generate_system_prompt()` is called
- THEN a string containing the A2UI schema is returned
- AND the prompt includes instructions for wrapping output in `<a2ui-json>` tags

#### Scenario: Get catalog config
- GIVEN the schema manager is initialized
- WHEN `get_catalog_config()` is called
- THEN the basic catalog configuration dict is returned

### Requirement: A2UI Parser
The system SHALL parse A2UI JSON from LLM text output.

#### Scenario: Parse valid A2UI
- GIVEN LLM output containing `<a2ui-json>...</a2ui-json>` tags
- WHEN `parse_a2ui_response()` is called
- THEN a list of parsed A2UI message dicts is returned

#### Scenario: Parse with auto-fix
- GIVEN LLM output with common JSON issues (trailing commas, etc.)
- WHEN `parse_a2ui_response()` is called
- THEN `parse_and_fix()` is attempted as fallback
- AND valid messages are returned

#### Scenario: Invalid output
- GIVEN LLM output with no valid A2UI JSON
- WHEN `parse_a2ui_response()` is called
- THEN a `ValueError` is raised

### Requirement: Validation
The system SHALL validate A2UI messages against the schema.

#### Scenario: Valid message
- GIVEN a valid A2UI message
- WHEN `validate()` is called
- THEN `True` is returned

#### Scenario: Invalid message
- GIVEN an invalid A2UI message
- WHEN `validate()` is called
- THEN `False` is returned
- AND the failure is logged
