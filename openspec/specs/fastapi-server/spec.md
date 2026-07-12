# FastAPI Server Specification

## Purpose
HTTP server with SSE streaming endpoint for A2UI messages.

## Requirements

### Requirement: Health Endpoint
The system SHALL provide a health check endpoint.

#### Scenario: Health check
- GIVEN the server is running
- WHEN `GET /api/health` is called
- THEN a JSON response with `{"status": "ok"}` is returned

### Requirement: Chat Endpoint
The system SHALL provide an SSE endpoint for chat messages.

#### Scenario: Send message
- GIVEN the server is running
- WHEN `POST /api/chat` is called with `{"message": "Find React courses"}`
- THEN an SSE stream is returned
- AND the stream contains valid `data: {json}\n\n` lines

#### Scenario: Stream end
- GIVEN an SSE stream is active
- WHEN all A2UI messages are sent
- THEN `data: [DONE]\n\n` is sent
- AND the connection is closed

#### Scenario: Error handling
- GIVEN the server encounters an error
- WHEN processing a chat request
- THEN an error message is streamed as A2UI
- AND the stream ends with `[DONE]`

### Requirement: CORS
The system SHALL allow requests from the Next.js frontend.

#### Scenario: CORS headers
- GIVEN a request from `http://localhost:3000`
- WHEN the request includes Origin header
- THEN CORS headers are added
- AND the request is allowed

### Requirement: SSE Format
The system SHALL use Server-Sent Events for streaming.

#### Scenario: Event format
- GIVEN A2UI messages to stream
- WHEN sending events
- THEN each message is formatted as `data: {json}\n\n`
- AND the content type is `text/event-stream`
