"use client";

import { useState, useEffect, useRef } from "react";
import { MessageProcessor } from "@a2ui/web_core/v0_9";
import { A2uiSurface } from "@a2ui/react/v0_9";
import type { ReactComponentImplementation } from "@a2ui/react/v0_9";
import type { SurfaceModel } from "@a2ui/web_core/v0_9";
import { courseCatalog } from "@/lib/a2ui-catalog";
import { streamA2UI } from "@/lib/sse-client";

export function A2UIChat() {
  const [input, setInput] = useState("");
  const [surfaces, setSurfaces] = useState<
    Map<string, SurfaceModel<ReactComponentImplementation>>
  >(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processorRef = useRef<MessageProcessor<ReactComponentImplementation> | null>(null);

  useEffect(() => {
    const processor = new MessageProcessor<ReactComponentImplementation>(
      [courseCatalog],
      (action) => {
        if (action.name === "navigate" && action.context?.url) {
          window.location.href = action.context.url;
        }
      }
    );

    processorRef.current = processor;

    const subCreated = processor.model.onSurfaceCreated.subscribe(
      (surface) => {
        setSurfaces((prev) => new Map(prev).set(surface.id, surface));
      }
    );

    const subDeleted = processor.model.onSurfaceDeleted.subscribe((id) => {
      setSurfaces((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    });

    return () => {
      subCreated.unsubscribe();
      subDeleted.unsubscribe();
      processor.model.dispose();
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      for await (const a2uiMsg of streamA2UI(userMessage)) {
        processorRef.current?.processMessages([a2uiMsg]);
      }
    } catch (err) {
      console.error("Stream error:", err);
      setError("Failed to get response. Is the backend running?");
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
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}
        {Array.from(surfaces.entries()).map(([surfaceId, surface]) => (
          <A2uiSurface key={surfaceId} surface={surface} />
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
