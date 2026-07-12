import json
import asyncio
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

from .agent.graph import agent

load_dotenv()

app = FastAPI(title="A2UI Demo Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/chat")
async def chat(request: Request):
    body = await request.json()
    user_message = body.get("message", "")

    async def event_stream():
        try:
            result = await asyncio.to_thread(
                lambda: agent.invoke(
                    {"messages": [{"role": "user", "content": user_message}], "a2ui_output": []}
                )
            )

            a2ui_messages = result.get("a2ui_output", [])

            for msg in a2ui_messages:
                yield f"data: {json.dumps(msg)}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            error_msg = {
                "version": "v0.9",
                "updateComponents": {
                    "surfaceId": "main",
                    "components": [
                        {"id": "error", "component": "Text", "text": f"Error: {str(e)}"}
                    ],
                },
            }
            yield f"data: {json.dumps(error_msg)}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
