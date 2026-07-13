import os
import logging
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_core.messages import AIMessage, ToolMessage, SystemMessage
from langchain_openai import ChatOpenAI

from .prompts import get_base_prompt, get_full_prompt
from .tools import search_courses, get_course_details
from .metrics import MetricsCallbackHandler
from a2ui_utils.parser import parse_response_with_text

logger = logging.getLogger(__name__)

A2UI_TOOLS = {"search_courses", "get_course_details"}


class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    a2ui_output: list[dict]
    a2ui_text: str
    llm_metrics: dict
    called_tools: list[str]


def create_agent():
    """Create the LangGraph agent for course catalog."""

    tools = [search_courses, get_course_details]
    model_name = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
    llm = ChatOpenAI(model=model_name, temperature=0, streaming=True).bind_tools(tools)
    tool_map = {tool.name: tool for tool in tools}

    base_prompt = get_base_prompt()
    full_prompt = get_full_prompt()

    def generate_ui(state: AgentState):
        """Generate UI response from the LLM."""
        messages = state["messages"]

        needs_schema = bool(set(state.get("called_tools", [])) & A2UI_TOOLS)
        system_prompt = full_prompt if needs_schema else base_prompt
        logger.info("Using %s prompt (needs_schema=%s, called_tools=%s)",
                     "full" if needs_schema else "base", needs_schema, state.get("called_tools", []))

        full_messages = [SystemMessage(content=system_prompt)] + messages

        logger.info("Calling LLM with %d messages", len(full_messages))

        metrics_handler = MetricsCallbackHandler()
        response = llm.invoke(full_messages, config={"callbacks": [metrics_handler]})
        content = response.content or ""
        tool_calls = getattr(response, "tool_calls", []) or []

        call_metrics = metrics_handler.get_metrics()
        prev = state.get("llm_metrics", {})
        total_latency = prev.get("latency_ms", 0) + call_metrics["latency_ms"]
        total_input = prev.get("tokens", {}).get("input", 0) + call_metrics["tokens"]["input"]
        total_output = prev.get("tokens", {}).get("output", 0) + call_metrics["tokens"]["output"]
        total_total = prev.get("tokens", {}).get("total", 0) + call_metrics["tokens"]["total"]
        llm_metrics = {
            "latency_ms": total_latency,
            "tokens": {"input": total_input, "output": total_output, "total": total_total},
        }

        logger.info("LLM call: %dms, tokens: %d/%d/%d",
                     call_metrics["latency_ms"],
                     call_metrics["tokens"]["input"],
                     call_metrics["tokens"]["output"],
                     call_metrics["tokens"]["total"])

        logger.info("LLM response content (first 200 chars): %s", content[:200])
        logger.info("LLM tool_calls: %s", [tc.get("name") for tc in tool_calls] if tool_calls else "none")

        text, a2ui_messages = parse_response_with_text(content)
        if a2ui_messages:
            logger.info("Parsed %d A2UI messages", len(a2ui_messages))
        if text:
            logger.info("Parsed text (first 100 chars): %s", text[:100])

        return {
            "messages": [AIMessage(content=content, tool_calls=tool_calls)],
            "a2ui_output": state.get("a2ui_output", []) + a2ui_messages,
            "a2ui_text": text,
            "llm_metrics": llm_metrics,
            "called_tools": [tc["name"] for tc in tool_calls] if tool_calls else state.get("called_tools", []),
        }

    def handle_tools(state: AgentState):
        """Handle tool calls if any."""
        last_message = state["messages"][-1]

        if not hasattr(last_message, "tool_calls") or not last_message.tool_calls:
            return {"messages": []}

        logger.info("Handling %d tool calls", len(last_message.tool_calls))

        results = []
        for tool_call in last_message.tool_calls:
            tool_name = tool_call["name"]
            tool_args = tool_call["args"]

            logger.info("Calling tool: %s with args: %s", tool_name, tool_args)

            if tool_name in tool_map:
                result = tool_map[tool_name].invoke(tool_args)
                logger.info("Tool %s returned %d chars", tool_name, len(str(result)))
                results.append(
                    ToolMessage(
                        content=str(result),
                        tool_call_id=tool_call["id"],
                    )
                )
            else:
                logger.warning("Unknown tool: %s", tool_name)

        return {"messages": results}

    def should_continue(state: AgentState):
        """Check if we should continue with tool calls."""
        last_message = state["messages"][-1]
        has_tool_calls = hasattr(last_message, "tool_calls") and last_message.tool_calls
        if has_tool_calls:
            logger.info("Decision: continue to tools (%d calls)", len(last_message.tool_calls))
            return "tools"
        logger.info("Decision: END (no tool calls)")
        return END

    workflow = StateGraph(AgentState)
    workflow.add_node("generate_ui", generate_ui)
    workflow.add_node("tools", handle_tools)
    workflow.set_entry_point("generate_ui")
    workflow.add_conditional_edges(
        "generate_ui", should_continue, {"tools": "tools", END: END}
    )
    workflow.add_edge("tools", "generate_ui")

    return workflow.compile()
