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
                        "a2ui_text": "",
                        "llm_metrics": {},
                        "called_tools": [],
                    }
                )
            )

            a2ui_messages = result.get("a2ui_output", [])
            a2ui_text = result.get("a2ui_text", "")
            llm_metrics = result.get("llm_metrics", {})
            logger.info("Agent produced %d A2UI messages, text=%d chars, metrics=%s",
                        len(a2ui_messages), len(a2ui_text), llm_metrics)

            if a2ui_text:
                text_payload = json.dumps({"type": "text", "content": a2ui_text})
                yield f"data: {text_payload}\n\n"

            if a2ui_messages:
                if a2ui_messages and "createSurface" not in a2ui_messages[0]:
                    surface_id = a2ui_messages[0].get("updateComponents", {}).get("surfaceId", "main")
                    create_msg = {
                        "version": "v0.9",
                        "createSurface": {
                            "surfaceId": surface_id,
                            "catalogId": "course-catalog",
                        },
                    }
                    a2ui_messages.insert(0, create_msg)

                for msg in a2ui_messages:
                    logger.info("Sending A2UI message: %s", json.dumps(msg)[:200])
                    yield f"data: {json.dumps(msg)}\n\n"

            if llm_metrics:
                metrics_payload = json.dumps({"type": "metrics", **llm_metrics})
                yield f"data: {metrics_payload}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            logger.error("Chat error: %s", e, exc_info=True)
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
