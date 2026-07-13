export async function* streamA2UI(userMessage: string): AsyncGenerator<any> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage }),
  });

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;

      const data = trimmed.slice(6);
      if (data === "[DONE]") return;

      try {
        const parsed = JSON.parse(data);
        yield parsed;
      } catch {
        // Skip invalid JSON
      }
    }
  }
}

export async function collectMessages(userMessage: string): Promise<any[]> {
  const messages: any[] = [];
  for await (const msg of streamA2UI(userMessage)) {
    messages.push(msg);
  }
  return messages;
}
