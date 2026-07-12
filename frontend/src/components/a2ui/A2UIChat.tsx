"use client";

import { useState, useEffect } from "react";
import { MessageProcessor } from "@a2ui/web_core/v0_9";
import { A2uiSurface } from "@a2ui/react/v0_9";
import { courseCatalog } from "@/lib/a2ui-catalog";
import { streamA2UI } from "@/lib/sse-client";
import { useRouter } from "next/navigation";

export function A2UIChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [surfaces, setSurfaces] = useState<Map<string, any>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const processor = new MessageProcessor({
    catalog: courseCatalog,
    actionHandler: (action: any) => {
      if (action.name === "navigate" && action.context?.url) {
        router.push(action.context.url);
      }
    },
  });

  useEffect(() => {
    processor.onSurfaceUpdate((surfaceId: string, state: any) => {
      setSurfaces((prev) => new Map(prev).set(surfaceId, state));
    });
  }, [processor]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      for await (const a2uiMsg of streamA2UI(userMessage)) {
        processor.processMessages([a2uiMsg]);
      }
    } catch (error) {
      console.error("Stream error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold">Course Catalog</h1>
      </header>

      <div className="flex-1 overflow-auto p-4">
        {Array.from(surfaces.entries()).map(([surfaceId, state]) => (
          <A2uiSurface key={surfaceId} surfaceId={surfaceId} state={state} />
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Find courses about React..."
            disabled={isLoading}
            className="flex-1 border rounded-lg px-4 py-2"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-2 disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
