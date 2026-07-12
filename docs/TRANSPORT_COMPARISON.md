# Transport Use Cases — When to use A2A, AG-UI, or Direct SSE

## Direct SSE (Current Transport)

### When to use?
- 1 Agent + 1 Client
- No agent discovery needed
- No task management needed
- Demo, prototype, simple product

### Concrete Example: Course Catalog Demo
```
┌──────────┐     SSE      ┌──────────┐
│ Next.js  │ <─────────── │ FastAPI  │
│ Frontend │   JSON stream│ + Agent  │
└──────────┘              └──────────┘
```

- Client knows exactly where the agent is (`localhost:8000`)
- Client sends 1 message, receives A2UI JSON
- No need to discover agents, no need to manage tasks
- **Simplest approach, fewest dependencies**

---

## A2A Protocol (Agent-to-Agent)

### When to use?

#### Use Case 1: Multi-Agent Orchestration
You're building an app with MULTIPLE agents, each with different expertise:

```
┌─────────────┐
│   User      │
│   "I want   │
│    to book  │
│    a table  │
│    at a     │
│    Japanese │
│    restaurant"│
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│  Orchestrator Agent (LangGraph)                   │
│  "Main agent - delegates to child agents"         │
│                                                   │
│  → Detects: User wants to book a table            │
│  → Decides to use 2 child agents:                 │
│    1. Restaurant Search Agent (find Japanese       │
│       restaurants)                                │
│    2. Booking Agent (make reservation)            │
└──────┬────────────────────────┬──────────────────┘
       │                        │
       ▼                        ▼
┌──────────────┐         ┌──────────────┐
│ Restaurant   │         │ Booking      │
│ Search Agent │         │ Agent        │
│ (finds       │         │ (makes       │
│  Japanese    │         │  reservation,│
│  restaurants)│         │  picks time) │
└──────────────┘         └──────────────┘
```

**Problems WITHOUT A2A:**
```python
# Without A2A: Orchestrator must know how to call each agent
# Each agent has different API and format

# Agent 1: REST API
response1 = requests.post("http://restaurant-agent:8001/search", json={...})

# Agent 2: gRPC
response2 = grpc.call("booking-agent:8002", "book_table", {...})

# Agent 3: GraphQL
response3 = requests.post("http://review-agent:8003/graphql", json={...})

# → Complex code, each agent has its own protocol
```

**With A2A:**
```python
# A2A: All agents follow the same protocol
from a2a.client import A2AClient

# Agent discovery - automatically find agents
restaurant_card = await a2a_client.get_agent_card("http://restaurant-agent:8001")
booking_card = await a2a_client.get_agent_card("http://booking-agent:8002")

# Send message - same format for all agents
response1 = await a2a_client.send_message(restaurant_card, message)
response2 = await a2a_client.send_message(booking_card, message)

# → Same API, same format, can call any agent
```

#### Use Case 2: Agent Marketplace
You're building a platform for multiple agents:
```
┌─────────────────────────────────────────────────┐
│  Agent Marketplace                               │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Agent A  │  │ Agent B  │  │ Agent C  │       │
│  │ (Travel) │  │ (Finance)│  │ (Health) │       │
│  │ Port 8001│  │ Port 8002│  │ Port 8003│       │
│  └──────────┘  └──────────┘  └──────────┘       │
│                                                   │
│  Users can call ANY agent                         │
│  without knowing ports or APIs in advance         │
└─────────────────────────────────────────────────┘
```

**A2A Agent Card:**
```json
// GET http://agent-a:8001/.well-known/agent-card.json
{
  "name": "Travel Agent",
  "description": "Helps book flights and hotels",
  "url": "http://agent-a:8001",
  "capabilities": ["streaming", "push_notifications"],
  "skills": [
    {"id": "flight_search", "description": "Search for flights"},
    {"id": "hotel_booking", "description": "Book hotels"}
  ]
}
```

→ Client auto-discovers: "Oh, this agent has flight_search skill, I'll call it"

#### Use Case 3: Enterprise Multi-Service
```
┌─────────────────────────────────────────────────────┐
│  Enterprise Internal Network                         │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ HR Agent     │  │ Finance      │  │ IT Support │ │
│  │ (leave,      │  │ Agent        │  │ Agent      │ │
│  │  payroll)    │  │ (expense,    │  │ (ticket,   │ │
│  │              │  │  budget)     │  │  reset pw) │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                       │
│  Employee chat → Orchestrator → Route to correct agent│
└─────────────────────────────────────────────────────┘
```

**WITHOUT A2A:**
```python
# Hardcode each agent
AGENTS = {
    "hr": "http://hr-agent:8010",
    "finance": "http://finance-agent:8011",
    "it": "http://it-support:8012",
}

# If adding a new agent → must modify orchestrator code
# If agent changes port → must modify code
# If agent upgrades version → must modify code
```

**With A2A:**
```python
# Dynamic discovery - no hardcoding needed
agent_cards = await discover_agents("http://internal-network:8000")

# Agents report their capabilities automatically
for card in agent_cards:
    print(f"{card.name}: {card.skills}")

# Adding a new agent → auto-discover, no code changes needed
```

### A2A Summary
| Feature | WITHOUT A2A | WITH A2A |
|---------|-------------|----------|
| Adding new agents | Hardcode API | Auto-discover |
| Changing ports | Modify code | Auto-discover |
| Multi-agent | Each agent different protocol | Same protocol |
| Task tracking | Self-implement | Built-in |
| Agent capabilities | Query manually | Agent card |

---

## AG-UI (Agent-User Interface)

### When to use?

#### Use Case 1: LangGraph + CopilotKit Integration
You're using LangGraph and want the frontend to automatically have A2UI:

**WITHOUT AG-UI:**
```python
# Backend: Implement A2UI tool for LLM from scratch
from langchain_core.tools import tool

@tool
def generate_a2ui(ui_json: str) -> str:
    """Generate A2UI UI from JSON"""
    # Validate, parse, manage state manually
    validate_a2ui_json(ui_json)
    return "UI generated"

# Inject system prompt manually
system_prompt = """
You are a helpful assistant.
When user asks for UI, call generate_a2ui tool.
Here is the A2UI schema: {schema}
"""

# Manage state manually
class AgentState:
    a2ui_messages: list
    surfaces: dict
```

```tsx
// Frontend: Implement everything from scratch
'use client';
import {MessageProcessor} from '@a2ui/web_core/v0_9';
import {A2uiSurface} from '@a2ui/react/v0_9';

// Create processor manually
const processor = new MessageProcessor([catalog], actionHandler);

// Parse SSE manually
const response = await fetch('/api/chat');
const reader = response.body.getReader();
while (true) {
  const {done, value} = await reader.read();
  const messages = parseSSE(value);
  processor.processMessages(messages);
}

// Render manually
<A2uiSurface surface={surface} />
```

**With AG-UI + CopilotKit:**
```python
# Backend: Just need middleware
from copilotkit import CopilotKitMiddleware
from langchain.agents import create_agent

graph = create_agent(
    model=ChatOpenAI(model="gpt-4o"),
    tools=[],
    middleware=[CopilotKitMiddleware()],  # ← Just one line
)
# CopilotKit auto-injects generate_a2ui tool
# CopilotKit auto-manages state
# CopilotKit auto-handles streaming
```

```tsx
// Frontend: Just need wrapping
'use client';
import {CopilotKit, CopilotChat} from '@copilotkit/react-core/v2';
import {createCatalog} from '@copilotkit/a2ui-renderer';

const catalog = createCatalog({
  CourseCard: { props: z.object({...}) },
}, {
  CourseCard: MyCourseCard,
});

// Just wrap the app
<CopilotKit runtimeUrl="/api/copilotkit" a2ui={{catalog}}>
  <CopilotChat />  {/* ← Auto has chat UI + A2UI rendering */}
</CopilotKit>
```

#### Use Case 2: Real-time State Sync
```
┌──────────┐                    ┌──────────┐
│ Frontend │ ◄──── AG-UI ────► │ Backend  │
│ (React)  │   Bi-directional   │ (Agent)  │
└──────────┘   state sync       └──────────┘

- User changes form → state syncs to backend
- Backend updates state → UI auto-updates
- No need to implement WebSocket handling
```

#### Use Case 3: Multi-Framework Support
```
┌─────────────────────────────────────────────┐
│ Same Agent (Python)                          │
│                                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │ React   │  │ Angular │  │ Vue.js  │     │
│  │ (Web)   │  │ (Web)   │  │ (Web)   │     │
│  └─────────┘  └─────────┘  └─────────┘     │
│                                               │
│  AG-UI handles transport for each framework  │
└─────────────────────────────────────────────┘
```

### AG-UI Summary
| Feature | WITHOUT AG-UI | WITH AG-UI |
|---------|---------------|------------|
| LangGraph integration | Self-implement tool | 1-line middleware |
| A2UI tool injection | Manual injection | Auto-inject |
| State management | Self-implement | Built-in |
| Streaming | Self-implement SSE | Built-in |
| Chat UI | Build from scratch | CopilotChat component |

---

## 3-Transport Comparison

```
                 Direct SSE           AG-UI             A2A
                 ──────────           ─────             ───
Complexity       Simple               Medium            Complex
Dependencies     0                    2-3 packages      1-2 packages
Agent discovery  ❌                   ❌                ✅
Multi-agent      ❌                   ❌ (via AG-UI)    ✅
Task management  ❌                   ❌                ✅
Auto tool inject ❌                   ✅                ❌
State sync       ❌                   ✅                ❌
Streaming        ✅ (self-implement)  ✅ (built-in)     ✅ (built-in)
Framework support Each framework      Multiple          Multiple agents
                 self-implement       frameworks        auto-handle

Best for:        Demo, prototype      LangGraph +       Enterprise
                 1 agent + 1 client   CopilotKit        Multi-agent
```

## Conclusion

| What do you need? | What to use? |
|-------------------|-------------|
| Simple demo, 1 agent + 1 client | **Direct SSE** |
| LangGraph + CopilotKit, need auto tools | **AG-UI** |
| Multiple agents, need discovery + task management | **A2A** |
| Enterprise multi-service | **A2A** |
| Multi-framework (React, Angular, Vue) | **AG-UI** |
