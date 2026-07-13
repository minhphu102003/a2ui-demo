"use client";

import { useState, useRef, useCallback } from "react";
import { streamA2UI } from "@/lib/sse-client";
import type { A2uiMessage } from "@a2ui/web_core/v0_9";

export interface TextMessage {
  type: "text";
  content: string;
}

export interface MetricsMessage {
  type: "metrics";
  latency_ms: number;
  tokens: { input: number; output: number; total: number };
}

interface UseChatStreamOptions {
  onA2UIMessage?: (msg: A2uiMessage) => void;
}

export function useChatStream(options?: UseChatStreamOptions) {
  const [textMessages, setTextMessages] = useState<TextMessage[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [metrics, setMetrics] = useState<MetricsMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const streamBufferRef = useRef("");

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setStreamingText("");
    setToolStatus(null);
    streamBufferRef.current = "";

    try {
      for await (const msg of streamA2UI(input)) {
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
          options?.onA2UIMessage?.(msg);
        }
      }
    } catch (err) {
      console.error("Stream error:", err);
      setError("Failed to get response. Is the backend running?");
    } finally {
      setIsLoading(false);
      setToolStatus(null);
    }
  }, [isLoading, options]);

  const clearMessages = useCallback(() => {
    setTextMessages([]);
    setStreamingText("");
    setMetrics(null);
    setError(null);
    setToolStatus(null);
  }, []);

  return {
    textMessages,
    streamingText,
    metrics,
    isLoading,
    error,
    toolStatus,
    sendMessage,
    clearMessages,
  };
}
