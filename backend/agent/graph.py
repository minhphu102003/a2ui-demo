from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_core.messages import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI

from .prompts import get_system_prompt
from .tools import search_courses, get_course_details
from ..a2ui import parse_a2ui_response


class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    a2ui_output: list[dict]


def create_agent():
    """Create the LangGraph agent for course catalog."""

    tools = [search_courses, get_course_details]
    llm = ChatOpenAI(model="gpt-4o", temperature=0).bind_tools(tools)
    tool_map = {tool.name: tool for tool in tools}

    system_prompt = get_system_prompt()

    def generate_ui(state: AgentState):
        """Generate UI response from the LLM."""
        messages = state["messages"]

        full_messages = [{"role": "system", "content": system_prompt}] + [
            m if isinstance(m, dict) else {"role": "user" if isinstance(m, HumanMessage) else "assistant", "content": m.content}
            for m in messages
        ]

        response = llm.invoke(full_messages)
        content = response.content

        a2ui_messages = []
        try:
            a2ui_messages = parse_a2ui_response(content)
        except ValueError:
            pass

        return {
            "messages": [AIMessage(content=content)],
            "a2ui_output": a2ui_messages,
        }

    def handle_tools(state: AgentState):
        """Handle tool calls if any."""
        last_message = state["messages"][-1]

        if not hasattr(last_message, "tool_calls") or not last_message.tool_calls:
            return {"messages": []}

        results = []
        for tool_call in last_message.tool_calls:
            tool_name = tool_call["name"]
            tool_args = tool_call["args"]

            if tool_name in tool_map:
                result = tool_map[tool_name].invoke(tool_args)
                results.append(
                    {
                        "role": "tool",
                        "content": result,
                        "tool_call_id": tool_call["id"],
                    }
                )

        return {"messages": [HumanMessage(content=str(r["content"])) for r in results]}

    def should_continue(state: AgentState):
        """Check if we should continue with tool calls."""
        last_message = state["messages"][-1]
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tools"
        return END

    workflow = StateGraph(AgentState)
    workflow.add_node("generate_ui", generate_ui)
    workflow.add_node("tools", handle_tools)
    workflow.set_entry_point("generate_ui")
    workflow.add_conditional_edges("generate_ui", should_continue, {"tools": "tools", END: END})
    workflow.add_edge("tools", "generate_ui")

    return workflow.compile()


agent = create_agent()
