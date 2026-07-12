# Delta for SSE Client

## ADDED Requirements

### Requirement: Stream Messages
The system SHALL provide an async generator for streaming A2UI messages.

#### Scenario: Stream from backend
- GIVEN a user message
- WHEN `streamA2UI()` is called
- THEN a POST request is sent to `/api/chat`
- AND the response body is read as SSE stream
- AND each `data: {json}\n\n` line is parsed
- AND parsed messages are yielded

#### Scenario: Stream end
- GIVEN an active stream
- WHEN `data: [DONE]\n\n` is received
- THEN the generator returns

#### Scenario: Network error
- GIVEN the backend is unreachable
- WHEN `streamA2UI()` is called
- THEN an error is thrown with status information

### Requirement: Configuration
The system SHALL use environment variable for backend URL.

#### Scenario: Custom backend URL
- GIVEN `NEXT_PUBLIC_BACKEND_URL` is set
- WHEN streaming messages
- THEN requests go to the configured URL

#### Scenario: Default backend URL
- GIVEN `NEXT_PUBLIC_BACKEND_URL` is not set
- WHEN streaming messages
- THEN requests go to `http://localhost:8000`

### Requirement: Message Collection
The system SHALL provide a convenience function to collect all messages.

#### Scenario: Collect all messages
- GIVEN a user message
- WHEN `collectMessages()` is called
- THEN all streamed messages are collected
- AND returned as an array
