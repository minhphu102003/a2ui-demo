# Proposal: Initial Implementation

## Intent
Build a demo project showcasing A2UI (Agent-to-User Interface) end-to-end:
Backend generates A2UI JSON via LangGraph agent, frontend renders components.

## Scope
In scope:
- Backend: FastAPI + LangGraph + OpenAI GPT-4o
- Frontend: Next.js 15 + Tailwind CSS + @a2ui/react
- Transport: SSE streaming
- Use case: Search courses → render cards → navigate to detail

Out of scope:
- Authentication
- Database (using mock data)
- Production deployment

## Approach
Phase 1: Backend setup (dependencies, schema, parser, agent, server)
Phase 2: Frontend setup (catalog, components, SSE client, chat UI)
Phase 3: Integration testing
