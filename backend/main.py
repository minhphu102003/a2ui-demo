import json
import asyncio
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

from agent import get_agent

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
                lambda: get_agent().invoke(
                    {
                        "messages": [{"role": "user", "content": user_message}],
                        "a2ui_output": [],
                    }
                )
            )

            a2ui_messages = result.get("a2ui_output", [])

            for msg in a2ui_messages:
                yield f"data: {json.dumps(msg)}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            logger.error(f"Chat error: {e}")
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
