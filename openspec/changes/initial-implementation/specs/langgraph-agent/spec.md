# Delta for LangGraph Agent

## ADDED Requirements

### Requirement: Agent Tools
The system SHALL provide tools for searching and retrieving course information.

#### Scenario: Search courses
- GIVEN the `search_courses` tool
- WHEN called with a query like "React"
- THEN a JSON string of matching courses is returned
- AND courses are filtered by title or description

#### Scenario: Get course details
- GIVEN the `get_course_details` tool
- WHEN called with a valid course ID
- THEN a JSON string with course details is returned

#### Scenario: Course not found
- GIVEN the `get_course_details` tool
- WHEN called with an invalid course ID
- THEN a JSON error message is returned

### Requirement: System Prompt
The system SHALL include A2UI schema in the system prompt.

#### Scenario: Prompt generation
- GIVEN the agent is initialized
- WHEN the system prompt is generated
- THEN it includes the A2UI schema from the schema manager
- AND it instructs the LLM to wrap output in `<a2ui-json>` tags

### Requirement: Agent Graph
The system SHALL use a LangGraph StateGraph for agent orchestration.

#### Scenario: Process user query
- GIVEN a user query
- WHEN the agent graph processes it
- THEN the LLM generates a response
- AND A2UI messages are parsed from the response
- AND the state includes `a2ui_output`

#### Scenario: Tool calls
- GIVEN the LLM decides to use a tool
- WHEN the agent processes the query
- THEN the tool is executed
- AND the result is fed back to the LLM
