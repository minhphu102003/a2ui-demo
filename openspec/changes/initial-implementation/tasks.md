# Tasks: Initial Implementation

## 1. Backend Project Setup
- [x] 1.1 Create `backend/pyproject.toml` with dependencies
- [x] 1.2 Create `backend/.env` with placeholder credentials
- [x] 1.3 Run `uv sync` to verify installation

## 2. A2UI Schema Manager
- [x] 2.1 Create `backend/a2ui/schema_manager.py`
- [x] 2.2 Implement `generate_system_prompt()` method
- [x] 2.3 Export singleton `schema_manager` instance

## 3. A2UI Parser
- [x] 3.1 Create `backend/a2ui/parser.py`
- [x] 3.2 Implement `parse()` method using SDK
- [x] 3.3 Implement `validate()` method
- [x] 3.4 Implement `parse_and_validate()` convenience function

## 4. LangGraph Agent
- [x] 4.1 Create `backend/agent/prompts.py`
- [x] 4.2 Create `backend/agent/tools.py` with mock course data
- [x] 4.3 Create `backend/agent/graph.py` with StateGraph

## 5. FastAPI Server
- [x] 5.1 Create `backend/main.py` with FastAPI app
- [x] 5.2 Implement `POST /api/chat` SSE endpoint
- [x] 5.3 Implement `GET /api/health` endpoint
- [x] 5.4 Configure CORS for Next.js

## 6. Frontend Project Setup
- [x] 6.1 Create `frontend/package.json`
- [x] 6.2 Create Next.js config files
- [x] 6.3 Run `npm install`

## 7. Frontend Catalog
- [x] 7.1 Create `frontend/src/lib/a2ui-catalog.ts`
- [x] 7.2 Create `frontend/src/components/a2ui/CourseCard.tsx`
- [x] 7.3 Create `frontend/src/components/a2ui/overrides.tsx`

## 8. SSE Client
- [x] 8.1 Create `frontend/src/lib/sse-client.ts`

## 9. Frontend Chat UI
- [x] 9.1 Create `frontend/src/components/a2ui/A2UIChat.tsx`
- [x] 9.2 Create `frontend/src/app/api/chat/route.ts`
- [x] 9.3 Create `frontend/src/app/layout.tsx`
- [x] 9.4 Create `frontend/src/app/page.tsx`
- [x] 9.5 Create `frontend/src/app/globals.css`
- [x] 9.6 Create `frontend/src/app/course/[id]/page.tsx`

## 10. Integration Testing
- [ ] 10.1 Start backend, verify health endpoint
- [ ] 10.2 Start frontend, verify home page loads
- [ ] 10.3 Test end-to-end flow
