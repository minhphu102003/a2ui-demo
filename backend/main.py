import json
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

A2UI_TAG = "<a2ui-json>"


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/chat")
async def chat(request: Request):
    body = await request.json()
    user_message = body.get("message", "")

    async def event_stream():
        try:
            graph = get_agent()
            input_state = {
                "messages": [{"role": "user", "content": user_message}],
                "a2ui_output": [],
                "a2ui_text": "",
                "llm_metrics": {},
                "called_tools": [],
            }

            final_state = None
            text_tokens = []
            total_latency_ms = 0
            total_tokens = {"input": 0, "output": 0, "total": 0}

            # Buffer: holds potential tag prefix starting from '<'
            tag_prefix = ""
            a2ui_found = False

            async for event in graph.astream_events(input_state, version="v2"):
                kind = event.get("event", "")

                if kind == "on_chat_model_stream" and not a2ui_found:
                    chunk = event["data"].get("chunk")
                    if chunk and hasattr(chunk, "content") and chunk.content:
                        token = chunk.content
                        text_tokens.append(token)

                        combined = tag_prefix + token

                        if A2UI_TAG in combined:
                            a2ui_found = True
                            pre_text = combined.split(A2UI_TAG)[0]
                            if pre_text:
                                yield f"data: {json.dumps({'type': 'text_delta', 'content': pre_text})}\n\n"
                            yield "data: " + json.dumps({"type": "text_done"}) + "\n\n"
                            tag_prefix = ""
                            continue

                        lt_index = combined.rfind("<")
                        if lt_index >= 0:
                            before_lt = combined[:lt_index]
                            after_lt = combined[lt_index:]

                            if before_lt:
                                yield f"data: {json.dumps({'type': 'text_delta', 'content': before_lt})}\n\n"

                            if after_lt == A2UI_TAG[:len(after_lt)]:
                                tag_prefix = after_lt
                            else:
                                if after_lt:
                                    yield f"data: {json.dumps({'type': 'text_delta', 'content': after_lt})}\n\n"
                                tag_prefix = ""
                        else:
                            tag_prefix = ""
                            yield f"data: {json.dumps({'type': 'text_delta', 'content': combined})}\n\n"

                if kind == "on_tool_start":
                    tool_name = event.get("name", "")
                    logger.info("Tool started: %s", tool_name)
                    yield f"data: {json.dumps({'type': 'tool_start', 'tool': tool_name})}\n\n"

                if kind == "on_tool_end":
                    tool_name = event.get("name", "")
                    logger.info("Tool finished: %s", tool_name)
                    yield f"data: {json.dumps({'type': 'tool_end', 'tool': tool_name})}\n\n"

                if kind == "on_chain_end":
                    output = event["data"].get("output", {})
                    if isinstance(output, dict) and "a2ui_output" in output:
                        final_state = output
                        step_metrics = output.get("llm_metrics", {})
                        if step_metrics:
                            total_latency_ms = step_metrics.get("latency_ms", total_latency_ms)
                            step_tokens = step_metrics.get("tokens", total_tokens)
                            total_tokens = {
                                "input": step_tokens.get("input", 0),
                                "output": step_tokens.get("output", 0),
                                "total": step_tokens.get("total", 0),
                            }

            # If no a2ui tag found, send remaining tag_prefix as text
            if not a2ui_found and tag_prefix:
                yield f"data: {json.dumps({'type': 'text_delta', 'content': tag_prefix})}\n\n"
            if text_tokens:
                yield "data: " + json.dumps({"type": "text_done"}) + "\n\n"

            if final_state:
                a2ui_messages = final_state.get("a2ui_output", [])
                a2ui_text = final_state.get("a2ui_text", "")

                logger.info(
                    "Agent produced %d A2UI messages, text=%d chars, metrics=%s",
                    len(a2ui_messages),
                    len(a2ui_text),
                    {"latency_ms": total_latency_ms, "tokens": total_tokens},
                )

                # Non-streaming fallback
                if a2ui_text and not text_tokens:
                    yield f"data: {json.dumps({'type': 'text', 'content': a2ui_text})}\n\n"

                if a2ui_messages:
                    if "createSurface" not in a2ui_messages[0]:
                        surface_id = (
                            a2ui_messages[0]
                            .get("updateComponents", {})
                            .get("surfaceId", "main")
                        )
                        a2ui_messages.insert(0, {
                            "version": "v0.9",
                            "createSurface": {
                                "surfaceId": surface_id,
                                "catalogId": "course-catalog",
                            },
                        })

                    for msg in a2ui_messages:
                        logger.info("Sending A2UI message: %s", json.dumps(msg)[:200])
                        yield f"data: {json.dumps(msg)}\n\n"

                if total_latency_ms or total_tokens.get("total", 0):
                    yield f"data: {json.dumps({'type': 'metrics', 'latency_ms': total_latency_ms, 'tokens': total_tokens})}\n\n"

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
