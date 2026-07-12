# Tasks: Initial Implementation

## 1. Backend Project Setup
- [ ] 1.1 Create `backend/pyproject.toml` with dependencies
- [ ] 1.2 Create `backend/.env` with placeholder credentials
- [ ] 1.3 Run `uv sync` to verify installation

## 2. A2UI Schema Manager
- [ ] 2.1 Create `backend/a2ui/schema_manager.py`
- [ ] 2.2 Implement `generate_system_prompt()` method
- [ ] 2.3 Export singleton `schema_manager` instance

## 3. A2UI Parser
- [ ] 3.1 Create `backend/a2ui/parser.py`
- [ ] 3.2 Implement `parse()` method using SDK
- [ ] 3.3 Implement `validate()` method
- [ ] 3.4 Implement `parse_and_validate()` convenience function

## 4. LangGraph Agent
- [ ] 4.1 Create `backend/agent/prompts.py`
- [ ] 4.2 Create `backend/agent/tools.py` with mock course data
- [ ] 4.3 Create `backend/agent/graph.py` with StateGraph

## 5. FastAPI Server
- [ ] 5.1 Create `backend/main.py` with FastAPI app
- [ ] 5.2 Implement `POST /api/chat` SSE endpoint
- [ ] 5.3 Implement `GET /api/health` endpoint
- [ ] 5.4 Configure CORS for Next.js

## 6. Frontend Project Setup
- [ ] 6.1 Create `frontend/package.json`
- [ ] 6.2 Create Next.js config files
- [ ] 6.3 Run `npm install`

## 7. Frontend Catalog
- [ ] 7.1 Create `frontend/src/lib/a2ui-catalog.ts`
- [ ] 7.2 Create `frontend/src/components/a2ui/CourseCard.tsx`
- [ ] 7.3 Create `frontend/src/components/a2ui/overrides.tsx`

## 8. SSE Client
- [ ] 8.1 Create `frontend/src/lib/sse-client.ts`

## 9. Frontend Chat UI
- [ ] 9.1 Create `frontend/src/components/a2ui/A2UIChat.tsx`
- [ ] 9.2 Create `frontend/src/app/api/chat/route.ts`
- [ ] 9.3 Create `frontend/src/app/layout.tsx`
- [ ] 9.4 Create `frontend/src/app/page.tsx`
- [ ] 9.5 Create `frontend/src/app/globals.css`
- [ ] 9.6 Create `frontend/src/app/course/[id]/page.tsx`

## 10. Integration Testing
- [ ] 10.1 Start backend, verify health endpoint
- [ ] 10.2 Start frontend, verify home page loads
- [ ] 10.3 Test end-to-end flow
