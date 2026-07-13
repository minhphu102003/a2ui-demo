# A2UI Demo — Agent Context

## Stack
- Backend: Python 3.12, FastAPI, LangGraph, OpenAI GPT-4o
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- A2UI: @a2ui/react, @a2ui/web_core, a2ui-agent-sdk
- Transport: SSE (Server-Sent Events)

## Project Structure
- `backend/` — Python FastAPI server
- `frontend/` — Next.js React app
- `openspec/` — Specifications and changes
- `docs/` — Documentation

## Design System (Taste-Skill)
- **Location**: `.agents/skills/design-taste-frontend/SKILL.md`
- **Install name**: `design-taste-frontend`
- **Custom rules**: A2UI-specific overrides at top of SKILL.md
- **Dial settings**: VARIANCE=5, MOTION=4, DENSITY=3
- **Fonts**: Geist + Geist Mono (via next/font)
- **Colors**: Zinc base + emerald accent
- **Effects**: Glass, noise overlay, diffused shadows

## Conventions
- Use `uv` for Python package management
- Use Tailwind CSS for styling
- Components go in `src/components/`
- API routes in `src/app/api/`
- Follow taste-skill rules for all frontend code

## Before Committing
- Backend: `cd backend && uv run ruff check`
- Frontend: `cd frontend && npm run lint && npm run typecheck`

## Key Files
- `openspec/specs/` — Source of truth for system behavior
- `openspec/changes/` — Active changes being worked on
- `openspec/changes/initial-implementation/` — Current change
- `.agents/skills/design-taste-frontend/SKILL.md` — Design rules
