"use client";

import { useState, useEffect, useRef } from "react";
import { MessageProcessor } from "@a2ui/web_core/v0_9";
import { A2uiSurface } from "@a2ui/react/v0_9";
import type { ReactComponentImplementation } from "@a2ui/react/v0_9";
import type { SurfaceModel } from "@a2ui/web_core/v0_9";
import { courseCatalog } from "@/lib/a2ui-catalog";
import { streamA2UI } from "@/lib/sse-client";

interface TextMessage {
  type: "text";
  content: string;
}

interface MetricsMessage {
  type: "metrics";
  latency_ms: number;
  tokens: { input: number; output: number; total: number };
}

export function A2UIChat() {
  const [input, setInput] = useState("");
  const [surfaces, setSurfaces] = useState<
    Map<string, SurfaceModel<ReactComponentImplementation>>
  >(new Map());
  const [textMessages, setTextMessages] = useState<TextMessage[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [metrics, setMetrics] = useState<MetricsMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const processorRef = useRef<MessageProcessor<ReactComponentImplementation> | null>(null);
  const streamBufferRef = useRef("");

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
    setStreamingText("");
    setToolStatus(null);
    streamBufferRef.current = "";

    try {
      for await (const msg of streamA2UI(userMessage)) {
        if (msg.type === "text_delta") {
          streamBufferRef.current += msg.content;
          setStreamingText(streamBufferRef.current);
        } else if (msg.type === "text_done") {
          const finalText = streamBufferRef.current;
          streamBufferRef.current = "";
          setStreamingText("");
          if (finalText) {
            setTextMessages((prev) => [...prev, { type: "text", content: finalText }]);
          }
        } else if (msg.type === "text") {
          setTextMessages((prev) => [...prev, msg]);
        } else if (msg.type === "tool_start") {
          setToolStatus(`Calling ${msg.tool}...`);
        } else if (msg.type === "tool_end") {
          setToolStatus(null);
        } else if (msg.type === "metrics") {
          setMetrics(msg);
        } else {
          try {
            processorRef.current?.processMessages([msg]);
          } catch (err) {
            console.error("A2UI processMessages error:", err);
          }
        }
      }
    } catch (err) {
      console.error("Stream error:", err);
      setError("Failed to get response. Is the backend running?");
    } finally {
      setIsLoading(false);
      setToolStatus(null);
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
        {textMessages.map((msg, i) => (
          <div key={`text-${i}`} className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-800">{msg.content}</p>
          </div>
        ))}
        {streamingText && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-800">
              {streamingText}
              <span className="animate-pulse text-blue-500">|</span>
            </p>
          </div>
        )}
        {toolStatus && (
          <div className="mb-4 p-2 bg-blue-50 text-blue-600 rounded-lg text-sm flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {toolStatus}
          </div>
        )}
        {Array.from(surfaces.entries()).map(([surfaceId, surface]) => (
          <A2uiSurface key={surfaceId} surface={surface} />
        ))}
      </div>

      <div className="p-4 border-t">
        {metrics && (
          <div className="text-xs text-gray-400 mb-2 flex gap-4">
            <span>{metrics.latency_ms}ms</span>
            <span>in: {metrics.tokens.input} / out: {metrics.tokens.output} / total: {metrics.tokens.total}</span>
          </div>
        )}
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
