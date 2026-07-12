# A2A Concrete Example — Multi-Agent Travel Booking

## Scenario
User: "I want to book a flight from Hanoi to Tokyo and find a hotel"

The main agent (Orchestrator) needs to call 2 child agents:
1. **Flight Agent** — search for flights
2. **Hotel Agent** — search for hotels

## Without A2A — Complex

```python
# orchestrator.py — Hardcode each agent API
import httpx

FLIGHT_AGENT_URL = "http://localhost:8001"
HOTEL_AGENT_URL = "http://localhost:8002"

async def search_flights(query: str):
    # Agent 1: REST API with custom format
    response = await httpx.AsyncClient().post(
        f"{FLIGHT_AGENT_URL}/api/v1/flights/search",
        json={"origin": "HAN", "destination": "NRT", "query": query},
        headers={"X-API-Version": "1.0"}
    )
    return response.json()["flights"]

async def search_hotels(query: str):
    # Agent 2: REST API but DIFFERENT format
    response = await httpx.AsyncClient().post(
        f"{HOTEL_AGENT_URL}/hotels",
        json={"city": "Tokyo", "keywords": query},
        # No custom headers
    )
    return response.json()["results"]

# Problems:
# - Each agent has different API endpoints
# - Each agent has different request formats
# - Each agent has different response formats
# - If agent 3 changes port → must update code
# - If adding a new agent → must update orchestrator
```

## With A2A — Simpler

```python
# orchestrator.py — Same API for all agents
from a2a.client import A2AClient
from a2a.types import Message, Part, TextPart

async def orchestrate(user_query: str):
    # 1. Discover agents (or hardcode if already known)
    agents = [
        await A2AClient.get_agent_card("http://localhost:8001"),
        await A2AClient.get_agent_card("http://localhost:8002"),
    ]

    # 2. Send to Flight Agent
    flight_message = Message(
        role="user",
        parts=[TextPart(text="Find flights from Hanoi to Tokyo")]
    )
    flight_response = await agents[0].send_message(flight_message)

    # 3. Send to Hotel Agent (same format!)
    hotel_message = Message(
        role="user",
        parts=[TextPart(text="Find hotels in Tokyo")]
    )
    hotel_response = await agents[1].send_message(hotel_message)

    # 4. Combine results
    return {
        "flights": extract_flights(flight_response),
        "hotels": extract_hotels(hotel_response),
    }

# Advantages:
# - Same API (send_message) for ANY agent
# - Agent card auto-reports capabilities
# - Adding a new agent → just discover, no code changes needed
```

## Agent Card — Self-describing capabilities

```json
// GET http://localhost:8001/.well-known/agent-card.json
{
  "name": "Flight Search Agent",
  "description": "Search and compare flights",
  "url": "http://localhost:8001",
  "version": "1.0",
  "capabilities": {
    "streaming": true,
    "push_notifications": false
  },
  "skills": [
    {
      "id": "search_flights",
      "name": "Flight Search",
      "description": "Search flights by origin, destination, and date"
    }
  ],
  "defaultInputModes": ["text"],
  "defaultOutputModes": ["text", "application/a2ui+json"]
}
```

```json
// GET http://localhost:8002/.well-known/agent-card.json
{
  "name": "Hotel Search Agent",
  "description": "Search and book hotels",
  "url": "http://localhost:8002",
  "skills": [
    {
      "id": "search_hotels",
      "name": "Hotel Search",
      "description": "Search hotels by city, date, and price"
    }
  ]
}
```

→ Orchestrator automatically knows: "Agent 1 has skill search_flights, Agent 2 has skill search_hotels"

## Task Management — Progress tracking

```python
# A2A has built-in task management
from a2a.types import Task, TaskState

# Create task
task = await agent.create_task(
    Task(
        id="booking-123",
        status=TaskState.SUBMITTED,
        message=Message(...)
    )
)

# Check status
task_status = await agent.get_task(task.id)
print(task_status.state)  # → "working", "completed", "failed"

# Update status
await agent.update_task(task.id, TaskState.COMPLETED, result=...)
```

## Streaming with A2A

```python
# Server side (Agent)
from a2a.server.tasks import InMemoryTaskStore

async def handle_message(message: Message):
    task = task_store.create_task(message)

    # Stream updates
    for chunk in agent.generate_response(message):
        task_store.update_task(
            task.id,
            status=TaskState.WORKING,
            message=Message(parts=[TextPart(text=chunk)])
        )

    task_store.update_task(task.id, status=TaskState.COMPLETED)
```

```typescript
// Client side
const stream = await a2aClient.sendMessageStream(message);

for await (const event of stream) {
  if (event.type === 'task_update') {
    console.log('Task status:', event.status);
    if (event.message?.parts) {
      // Process A2UI messages
      processor.processMessages(event.message.parts);
    }
  }
}
```

## A2A Conclusion

| Feature | Without A2A | With A2A |
|---------|-------------|----------|
| Calling agents | `POST /api/v1/xxx` (each agent has different API) | `send_message()` (same API for all) |
| Agent discovery | Hardcode URL + endpoints | `get_agent_card()` |
| Task tracking | Self-implement database | Built-in task store |
| Streaming | Self-implement SSE | Built-in |
| Versioning | Self-manage | Agent card has version |
| Adding new agents | Modify orchestrator code | Auto-discover |

**A2A is worth using when:**
- You have > 1 agent
- Agents are across different services
- You need auto-discover capabilities
- You need task management (submit → working → completed)
- Enterprise environment with multiple teams building their own agents
