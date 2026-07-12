# Delta for Frontend Chat

## ADDED Requirements

### Requirement: Chat UI
The system SHALL display a chat interface for user interaction.

#### Scenario: Display chat
- GIVEN the home page is loaded
- WHEN the page renders
- THEN a header with "Course Catalog" is shown
- AND an input field for messages is shown
- AND a send button is shown

#### Scenario: Send message
- GIVEN the user types a message
- WHEN they click send or press Enter
- THEN the message is sent to the backend
- AND a loading state is shown
- AND responses are streamed back

#### Scenario: Display surfaces
- GIVEN A2UI messages are received
- WHEN `MessageProcessor` processes them
- THEN `A2uiSurface` components are rendered

### Requirement: API Proxy
The system SHALL proxy API requests to avoid CORS issues.

#### Scenario: Proxy chat request
- GIVEN a chat message from the frontend
- WHEN `POST /api/chat` is called on the Next.js server
- THEN the request is forwarded to the backend
- AND the SSE stream is proxied back

### Requirement: Course Detail Page
The system SHALL display course details when navigating.

#### Scenario: View course
- GIVEN a user clicks a course card
- WHEN they navigate to `/course/[id]`
- THEN the course detail page is shown
- AND the course title is displayed
- AND the instructor is displayed
- AND a video player placeholder is shown

#### Scenario: Back navigation
- GIVEN the user is on the course detail page
- WHEN they click the back button
- THEN they are navigated to the home page

### Requirement: Navigation Actions
The system SHALL handle navigation actions from A2UI components.

#### Scenario: Navigate action
- GIVEN an A2UI component with a navigate action
- WHEN the action is triggered
- THEN the user is navigated to the specified URL
