# A2UI Demo — Course Catalog Agent

## Overview

Demo project showcasing how A2UI (Agent-to-User Interface) works end-to-end:
- **Backend**: Python 3.12 + FastAPI + LangGraph + OpenAI GPT-4o
- **Frontend**: Next.js 15 + Tailwind CSS + @a2ui/react
- **Transport**: SSE (Server-Sent Events)
- **Use Case**: Search courses → render course cards → click to navigate to course detail

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Backend (Python 3.12)                                  │
│  FastAPI + LangGraph + OpenAI GPT-4o                    │
│                                                         │
│  User Query ──> LangGraph Agent ──> OpenAI GPT-4o       │
│                      │                                  │
│                      ▼                                  │
│              A2uiSchemaManager                          │
│              (system prompt + catalog)                  │
│                      │                                  │
│                      ▼                                  │
│              LLM sinh A2UI JSON                         │
│                      │                                  │
│                      ▼                                  │
│              SSE Stream ──────────────────────────────> │
└─────────────────────────────────────────────────────────┘
                                                      │
                                                      ▼
┌─────────────────────────────────────────────────────────┐
│  Frontend (Next.js + Tailwind CSS)                      │
│                                                         │
│  fetch('/api/chat') ──> ReadableStream (SSE)            │
│        │                                                │
│        ▼                                                │
│  MessageProcessor.processMessages(a2ui_json)            │
│        │                                                │
│        ▼                                                │
│  A2uiSurface ──> Catalog lookup ──> React Components    │
│        │                                                │
│        ▼                                                │
│  Render: CourseCard, Button, Text, Row, Column...       │
│  (override with Tailwind CSS)                           │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
E:\a2ui-demo\
├── README.md
├── SPEC.md                           # This file
├── .gitignore
│
├── backend/
│   ├── pyproject.toml                # Python project config (uv)
│   ├── .env                          # OPENAI_API_KEY
│   ├── main.py                       # FastAPI app entry point
│   │
│   ├── agent/
│   │   ├── __init__.py
│   │   ├── graph.py                  # LangGraph agent definition
│   │   ├── tools.py                  # Agent tools (search courses, etc.)
│   │   └── prompts.py               # System prompt with A2UI schema
│   │
│   └── a2ui/
│       ├── __init__.py
│       ├── schema_manager.py         # A2uiSchemaManager wrapper
│       └── parser.py                 # Parse + validate A2UI JSON
│
└── frontend/
    ├── package.json
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── postcss.config.mjs
    │
    └── src/
        ├── app/
        │   ├── layout.tsx            # Root layout + providers
        │   ├── page.tsx              # Home page (chat UI)
        │   ├── globals.css           # Tailwind base styles
        │   │
        │   ├── course/
        │   │   └── [id]/
        │   │       └── page.tsx      # Course detail page
        │   │
        │   └── api/
        │       └── chat/
        │           └── route.ts      # API proxy → backend SSE
        │
        ├── components/
        │   ├── a2ui/
        │   │   ├── A2UIChat.tsx      # Main A2UI chat renderer
        │   │   ├── CourseCard.tsx     # Custom course card component
        │   │   ├── VideoPlayer.tsx    # Custom video player component
        │   │   └── overrides.tsx     # Override basic components w/ Tailwind
        │   │
        │   └── ui/                    # Reusable Tailwind UI components
        │       ├── Button.tsx
        │       └── Card.tsx
        │
        ├── lib/
        │   ├── a2ui-catalog.ts       # Custom catalog definition
        │   └── sse-client.ts         # SSE streaming client
        │
        └── styles/
            └── globals.css           # Tailwind + A2UI CSS variables
```

## Tech Stack

### Backend

| Component | Version | Purpose |
|-----------|---------|---------|
| Python | 3.12+ | Runtime |
| FastAPI | 0.115+ | HTTP framework + SSE |
| LangGraph | 0.2+ | Agent orchestration |
| langchain-openai | 0.2+ | OpenAI integration |
| a2ui-agent-sdk | latest | A2UI schema, parsing, validation |
| uvicorn | 0.30+ | ASGI server |
| pydantic | 2.0+ | Data validation |
| python-dotenv | 1.0+ | Env management |

### Frontend

| Component | Version | Purpose |
|-----------|---------|---------|
| Next.js | 15+ | React framework |
| React | 19+ | UI library |
| @a2ui/react | latest | A2UI React renderer |
| @a2ui/web_core | latest | A2UI core state logic |
| Tailwind CSS | 4.0+ | Utility-first CSS |
| Zod | 3.25+ | Schema validation |
| TypeScript | 5.0+ | Type safety |

## Implementation Steps

### Phase 1: Backend Setup

#### Step 1.1: Init Python project
- Create `backend/pyproject.toml` with dependencies
- Create `backend/.env` with `OPENAI_API_KEY`
- Run `uv sync` to install dependencies

#### Step 1.2: A2UI Schema Manager
- File: `backend/a2ui/schema_manager.py`
- Wrap `A2uiSchemaManager` from a2ui-agent-sdk
- Configure with v0.9 protocol + basic catalog
- Generate system prompts for LLM

#### Step 1.3: A2UI Parser
- File: `backend/a2ui/parser.py`
- Use `parse_response()` to extract A2UI JSON from LLM output
- Use `A2uiValidator` to validate against schema
- Auto-fix common issues with `parse_and_fix()`

#### Step 1.4: LangGraph Agent
- File: `backend/agent/graph.py`
- Create `StateGraph` with single node `generate_ui`
- Node flow: query → system prompt → OpenAI → parse → validate → return
- File: `backend/agent/prompts.py`
- System prompt: "You are a course catalog assistant..."
- Include A2UI schema via `schema_manager.generate_system_prompt()`

#### Step 1.5: Agent Tools
- File: `backend/agent/tools.py`
- `search_courses(query)` — mock course database
- `get_course_details(course_id)` — get single course info
- Tools return data that agent uses to compose A2UI JSON

#### Step 1.6: FastAPI Server
- File: `backend/main.py`
- `POST /api/chat` — SSE endpoint
  - Receive `{message: string}`
  - Run LangGraph agent
  - Stream A2UI messages as SSE events
- `GET /api/health` — health check
- CORS config for `http://localhost:3000` (Next.js dev)

### Phase 2: Frontend Setup

#### Step 2.1: Init Next.js project
- `npx create-next-app@latest frontend --typescript --tailwind --app`
- Configure `next.config.ts`
- Install `@a2ui/react`, `@a2ui/web_core`, `zod`

#### Step 2.2: Custom Catalog
- File: `frontend/src/lib/a2ui-catalog.ts`
- Define `CourseCardApi` with Zod schema
- Implement `CourseCard` React component with Tailwind
- Override basic components (Text, Button, Row, Column, Card, List)
- Create `courseCatalog` with all components

#### Step 2.3: SSE Client
- File: `frontend/src/lib/sse-client.ts`
- `streamA2UI(userMessage)` — async generator
- POST to `/api/chat`, read SSE stream
- Parse `data: {json}\n\n` lines
- Yield parsed A2UI messages

#### Step 2.4: A2UI Chat Component
- File: `frontend/src/components/a2ui/A2UIChat.tsx`
- Create `MessageProcessor` with `courseCatalog`
- Handle surface creation/deletion events
- Input field + send button
- Render surfaces via `<A2uiSurface>`
- Handle actions (navigation, etc.)

#### Step 2.5: API Proxy
- File: `frontend/src/app/api/chat/route.ts`
- Proxy POST requests to backend SSE endpoint
- Forward response stream to client

#### Step 2.6: Course Detail Page
- File: `frontend/src/app/course/[id]/page.tsx`
- Static page showing course info
- Video player component
- Back button to home

### Phase 3: Integration & Testing

#### Step 3.1: End-to-end flow
- Start backend: `cd backend && uv run uvicorn main:app --reload`
- Start frontend: `cd frontend && npm run dev`
- Test: "Find courses about React" → cards render
- Test: Click card → navigate to `/course/[id]`

#### Step 3.2: A2UI Message Flow Verification
- Verify SSE stream format is correct
- Verify MessageProcessor processes messages
- Verify A2uiSurface renders components
- Verify actions trigger navigation

## A2UI Message Format

### Server → Client Messages

```jsonl
{"version":"v0.9","createSurface":{"surfaceId":"main","catalogId":"https://example.com/catalogs/course.json"}}
{"version":"v0.9","updateComponents":{"surfaceId":"main","components":[
  {"id":"root","component":"Column","children":["title","search","list"]},
  {"id":"title","component":"Text","text":"Course Catalog","variant":"h1"},
  {"id":"search","component":"TextField","label":"Search courses..."},
  {"id":"list","component":"List","children":["card1","card2","card3"]},
  {"id":"card1","component":"CourseCard","title":"React Fundamentals","instructor":"John Doe","thumbnail":"https://...","description":"Learn React from scratch"},
  {"id":"card2","component":"CourseCard","title":"Advanced React","instructor":"Jane Smith","thumbnail":"https://...","description":"Deep dive into React"},
  {"id":"card3","component":"CourseCard","title":"React Native","instructor":"Mike Johnson","thumbnail":"https://...","description":"Build mobile apps"}
]}}
{"version":"v0.9","updateDataModel":{"surfaceId":"main","path":"/","value":{"courses":[{"id":1,"title":"React Fundamentals"},{"id":2,"title":"Advanced React"},{"id":3,"title":"React Native"}]}}}
```

### Client → Server Actions

```json
{"version":"v0.9","action":{"name":"navigate","surfaceId":"main","context":{"url":"/course/1"}}}
```

## Custom Components

### CourseCard

```typescript
{
  name: 'CourseCard',
  schema: {
    title: string,        // Course title
    instructor: string,   // Instructor name
    thumbnail: string,    // Image URL
    description: string,  // Short description
    action?: Action,      // Click action (navigate to detail)
  }
}
```

Renders as:
```
┌─────────────────────┐
│ [thumbnail image]   │
├─────────────────────┤
│ Course Title        │
│ Instructor Name     │
│ Description text... │
└─────────────────────┘
```

### Override Components

All basic components are overridden with Tailwind CSS classes:

| Component | Override |
|-----------|----------|
| Text | `text-gray-800`, variant-based sizing |
| Button | `bg-blue-500 hover:bg-blue-600 text-white rounded-lg` |
| Row | `flex flex-row gap-4` |
| Column | `flex flex-col gap-4` |
| Card | `rounded-xl border bg-white shadow-sm p-4` |
| List | `flex flex-col gap-4` |
| TextField | `border rounded-lg px-4 py-2 w-full` |

## Environment Variables

### Backend (`.env`)
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## Running the Project

```bash
# Terminal 1: Backend
cd E:\a2ui-demo\backend
uv sync
uv run uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
cd E:\a2ui-demo\frontend
npm install
npm run dev
```

Open `http://localhost:3000` and type "Find courses about React".

## Key APIs Used

### Backend (a2ui-agent-sdk)

| API | Import | Purpose |
|-----|--------|---------|
| `A2uiSchemaManager` | `a2ui.schema.manager` | Generate system prompts with schema |
| `BasicCatalog.get_config()` | `a2ui.basic_catalog.provider` | Load basic component catalog |
| `parse_response()` | `a2ui.parser.parser` | Parse A2UI JSON from LLM text |
| `parse_and_fix()` | `a2ui.parser.payload_fixer` | Auto-fix common JSON issues |
| `A2uiValidator` | `a2ui.schema.validator` | Validate JSON against schema |
| `remove_strict_validation` | `a2ui.schema.common_modifiers` | Relax schema for LLM flexibility |

### Frontend (@a2ui/react)

| API | Import | Purpose |
|-----|--------|---------|
| `MessageProcessor` | `@a2ui/web_core/v0_9` | Process A2UI messages into state |
| `A2uiSurface` | `@a2ui/react/v0_9` | Render a surface |
| `basicCatalog` | `@a2ui/react/v0_9` | Default component catalog |
| `Catalog` | `@a2ui/web_core/v0_9` | Create custom catalog |
| `createComponentImplementation` | `@a2ui/react/v0_9` | Create custom component |

## Notes

- A2UI messages must be wrapped in `<a2ui-json>...</a2ui-json>` tags in LLM output
- The parser extracts JSON from these tags automatically
- Custom components must be registered in the catalog before they can be rendered
- Actions from components are dispatched to the `actionHandler` callback in MessageProcessor
- SSE streaming allows progressive rendering as messages arrive
