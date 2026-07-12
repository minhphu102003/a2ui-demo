# AG-UI Concrete Example — LangGraph + CopilotKit

## Scenario
You're building an app with LangGraph agent + Next.js frontend.
The agent helps users find courses and renders UI.

## Without AG-UI — Implement everything yourself

### Backend: Build A2UI tool from scratch

```python
# agent.py — Implement from scratch
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END
import json

# 1. Load A2UI schema manually
A2UI_SCHEMA = json.load(open("specification/v0_9/catalog.json"))

# 2. Create system prompt manually
SYSTEM_PROMPT = f"""
You are a course catalog assistant.
When user asks for courses, generate A2UI JSON.

A2UI Schema:
{json.dumps(A2UI_SCHEMA, indent=2)}

Wrap your A2UI output in <a2ui-json> tags.
"""

# 3. Manage state manually
class AgentState:
    messages: list
    a2ui_output: str | None = None

# 4. Implement agent node manually
def generate_node(state: AgentState):
    llm = ChatOpenAI(model="gpt-4o")
    messages = [SystemMessage(content=SYSTEM_PROMPT)] + state.messages
    response = llm.invoke(messages)

    # Parse A2UI from response manually
    if "<a2ui-json>" in response.content:
        a2ui_json = response.content.split("<a2ui-json>")[1].split("</a2ui-json>")[0]
        state.a2ui_output = a2ui_json

    return state

# 5. Build graph manually
graph = StateGraph(AgentState)
graph.add_node("generate", generate_node)
graph.set_entry_point("generate")
graph.add_edge("generate", END)
app = graph.compile()

# 6. Validate A2UI JSON manually
def validate_a2ui(json_str: str) -> bool:
    # Validate against schema manually
    data = json.loads(json_str)
    # ... validation logic
    return True
```

### Frontend: Implement SSE + rendering from scratch

```tsx
// page.tsx — Implement from scratch
'use client';
import {useState, useEffect, useCallback} from 'react';
import {MessageProcessor} from '@a2ui/web_core/v0_9';
import {A2uiSurface, basicCatalog} from '@a2ui/react/v0_9';

export default function Home() {
  // 1. Create processor manually
  const [processor] = useState(() =>
    new MessageProcessor([basicCatalog], (action) => {
      console.log('Action:', action);
      // Handle navigation, actions, etc. manually
    })
  );

  // 2. Manage surfaces state manually
  const [surfaces, setSurfaces] = useState(() =>
    Array.from(processor.model.surfacesMap.values())
  );

  useEffect(() => {
    const sub1 = processor.onSurfaceCreated(() =>
      setSurfaces(Array.from(processor.model.surfacesMap.values()))
    );
    const sub2 = processor.onSurfaceDeleted(() =>
      setSurfaces(Array.from(processor.model.surfacesMap.values()))
    );
    return () => { sub1.unsubscribe(); sub2.unsubscribe(); };
  }, [processor]);

  // 3. Implement SSE client manually
  const sendMessage = useCallback(async (text: string) => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({message: text}),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, {stream: true});

      const lines = buffer.split('\n');
      buffer = lines.pop()!;

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const messages = JSON.parse(line.slice(6));
          processor.processMessages(messages);
        }
      }
    }
  }, [processor]);

  // 4. Build chat UI manually
  const [input, setInput] = useState('');
  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={() => sendMessage(input)}>Send</button>
      {surfaces.map(s => (
        <A2uiSurface key={s.id} surface={s} />
      ))}
    </div>
  );
}
```

### Backend API: Implement SSE endpoint from scratch

```python
# main.py — Implement from scratch
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from agent import app as agent_app

app = FastAPI()

@app.post("/api/chat")
async def chat(request: ChatRequest):
    # Run agent manually
    state = agent_app.invoke({"messages": [HumanMessage(content=request.message)]})

    # Parse A2UI JSON manually
    a2ui_messages = json.loads(state["a2ui_output"])

    # Stream SSE manually
    async def stream():
        for msg in a2ui_messages:
            yield f"data: {json.dumps(msg)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream")
```

### Summary: Self-implemented
- ~100 lines of backend code (agent + API + validation)
- ~80 lines of frontend code (SSE client + state management + rendering)
- Manual A2UI schema loading
- Manual SSE streaming implementation
- Manual error handling and retries

---

## With AG-UI + CopilotKit — Less code

### Backend: Just need middleware

```python
# agent.py — Just need 1 middleware
from copilotkit import CopilotKitMiddleware
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

graph = create_agent(
    model=ChatOpenAI(model="gpt-4o"),
    tools=[],
    middleware=[CopilotKitMiddleware()],  # ← Single line
    system_prompt="You are a course catalog assistant.",
)

# Done! CopilotKit automatically:
# - Injects generate_a2ui tool into agent
# - Handles streaming
# - Manages state
# - Validates A2UI JSON
```

```python
# main.py — Simple API endpoint
from fastapi import FastAPI
from ag_ui import AGUIEndpoint

app = FastAPI()
app.include_router(AGUIEndpoint(graph).router)
# Done! Automatically handles SSE, state sync, etc.
```

### Frontend: Just need wrapping

```tsx
// layout.tsx — Just need to wrap the app
import {CopilotKit, CopilotChat} from '@copilotkit/react-core/v2';
import {createCatalog} from '@copilotkit/a2ui-renderer';
import {z} from 'zod';

// 1. Define catalog (just once)
const catalog = createCatalog(
  {
    CourseCard: {
      description: 'A course card with thumbnail',
      props: z.object({
        title: z.string(),
        instructor: z.string(),
        thumbnail: z.string().url(),
      }),
    },
  },
  {
    CourseCard: MyCourseCardComponent,  // React component
  },
  { includeBasicCatalog: true }
);

// 2. Wrap the app
export default function RootLayout({children}) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" a2ui={{catalog}}>
      {children}
    </CopilotKit>
  );
}
```

```tsx
// page.tsx — Chat UI is ready to use
'use client';
import {CopilotChat} from '@copilotkit/react-core/v2';

export default function Home() {
  return (
    <div className="h-screen">
      <CopilotChat
        className="h-full"
        labels={{title: "Course Assistant", initial: "How can I help?"}}
      />
    </div>
  );
}
// Done! You get:
// - Chat UI with input
// - Message history
// - A2UI rendering
// - Streaming responses
// - Action handling
```

### Summary: With AG-UI
- ~10 lines of backend code (agent + middleware + API)
- ~30 lines of frontend code (catalog + layout)
- CopilotKit handles: streaming, state sync, A2UI tool injection, validation

---

## Lines of Code Comparison

| Component | Without AG-UI | With AG-UI |
|-----------|---------------|------------|
| Backend agent | ~40 lines | ~10 lines |
| Backend API | ~30 lines | ~5 lines |
| Frontend SSE | ~40 lines | 0 (built-in) |
| Frontend state | ~30 lines | 0 (built-in) |
| Frontend UI | ~50 lines | ~15 lines |
| **Total** | **~190 lines** | **~30 lines** |

## When to use AG-UI?

| Scenario | What to use? |
|----------|-------------|
| Simple demo, want to understand A2UI | Direct SSE |
| LangGraph + Next.js production | AG-UI + CopilotKit |
| Need ready-made chat UI | AG-UI + CopilotKit |
| Need real-time state sync | AG-UI |
| Need multi-framework support | AG-UI |
| 1 agent, 1 client, minimal code | Direct SSE |

## Conclusion

**AG-UI is worth using when:**
- You're using LangGraph and want quick integration
- You need CopilotKit chat UI
- You want less code
- You need real-time state sync
- You need multi-framework support (React, Angular, Vue)

**AG-UI is NOT needed when:**
- Simple demos
- You want to understand A2UI at a low level
- You don't want additional dependencies
- You only need 1 agent + 1 client
