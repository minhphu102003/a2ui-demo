# A2UI Demo — Course Catalog Agent

Demo project showcasing **A2UI (Agent-to-User Interface)** with a course catalog use case.

## What is this?

An AI agent that generates interactive UI for browsing courses. The agent sends A2UI JSON, and the frontend renders it with custom React components styled with Tailwind CSS.

## Tech Stack

- **Backend**: Python 3.12, FastAPI, LangGraph, OpenAI GPT-4o
- **Frontend**: Next.js 15, React 19, Tailwind CSS, @a2ui/react
- **Transport**: SSE (Server-Sent Events)

## Quick Start

```bash
# Backend
cd backend
uv sync
uv run uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and try:
- "Find courses about React"
- "Show me JavaScript courses"
- "What courses are available?"

## How it works

```
User types query
    ↓
Backend agent (LangGraph + GPT-4o)
    ↓
Generates A2UI JSON (course cards, text, layout)
    ↓
Streams via SSE to frontend
    ↓
MessageProcessor interprets messages
    ↓
A2uiSurface renders React components
    ↓
User sees styled course cards
    ↓
Click card → navigate to course detail page
```

## Project Structure

```
a2ui-demo/
├── backend/           # Python FastAPI + LangGraph agent
│   ├── main.py        # FastAPI server + SSE endpoint
│   ├── agent/         # LangGraph agent logic
│   └── a2ui/          # A2UI schema + parsing
│
└── frontend/          # Next.js + Tailwind CSS
    └── src/
        ├── app/       # Pages + API routes
        ├── components/ # React components
        └── lib/       # A2UI catalog + SSE client
```

## Learn More

- [A2UI Documentation](https://a2ui.org)
- [A2UI Protocol Spec](https://a2ui.org/specification)
- [SPEC.md](./SPEC.md) — Detailed implementation plan
