# Design: Initial Implementation

## Technical Approach

### Backend Architecture

```
User Query → FastAPI → LangGraph Agent → OpenAI GPT-4o
                         │
                         ▼
                  A2uiSchemaManager
                  (system prompt + catalog)
                         │
                         ▼
                  LLM generates A2UI JSON
                         │
                         ▼
                  A2UI Parser + Validator
                         │
                         ▼
                  SSE Stream → Frontend
```

### Frontend Architecture

```
fetch('/api/chat') → ReadableStream (SSE)
        │
        ▼
streamA2UI() → AsyncGenerator
        │
        ▼
MessageProcessor.processMessages(a2ui_json)
        │
        ▼
A2uiSurface → Catalog lookup → React Components
```

## Architecture Decisions

### Decision: SSE over WebSocket
Using SSE because:
- Simpler implementation for unidirectional server→client streaming
- No additional dependencies needed
- Works well with Next.js API routes

### Decision: Mock Course Data
Using in-memory mock data because:
- Demo project, no persistence needed
- Easy to test and demonstrate
- Can be replaced with real database later

### Decision: API Proxy Pattern
Using Next.js API routes as proxy because:
- Avoids CORS issues during development
- Single origin for frontend requests
- Can add auth middleware later

## Data Flow

```
1. User types message in chat input
2. Frontend POST /api/chat → Next.js proxy → Backend
3. Backend runs LangGraph agent
4. Agent calls OpenAI with A2UI schema in system prompt
5. LLM generates A2UI JSON in <a2ui-json> tags
6. Parser extracts and validates JSON
7. Backend streams A2UI messages as SSE events
8. Frontend parses SSE stream
9. MessageProcessor updates state
10. A2uiSurface renders components
```

## File Changes

### Backend (new)
- `backend/pyproject.toml`
- `backend/.env`
- `backend/main.py`
- `backend/agent/__init__.py` (update)
- `backend/agent/graph.py`
- `backend/agent/tools.py`
- `backend/agent/prompts.py`
- `backend/a2ui/__init__.py` (update)
- `backend/a2ui/schema_manager.py`
- `backend/a2ui/parser.py`

### Frontend (new)
- `frontend/package.json`
- `frontend/next.config.ts`
- `frontend/tsconfig.json`
- `frontend/tailwind.config.ts`
- `frontend/postcss.config.mjs`
- `frontend/.env.local`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/app/globals.css`
- `frontend/src/app/api/chat/route.ts`
- `frontend/src/app/course/[id]/page.tsx`
- `frontend/src/components/a2ui/A2UIChat.tsx`
- `frontend/src/components/a2ui/CourseCard.tsx`
- `frontend/src/components/a2ui/overrides.tsx`
- `frontend/src/components/ui/Button.tsx`
- `frontend/src/components/ui/Card.tsx`
- `frontend/src/lib/a2ui-catalog.ts`
- `frontend/src/lib/sse-client.ts`
