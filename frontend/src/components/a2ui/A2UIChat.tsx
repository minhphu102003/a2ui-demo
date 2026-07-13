"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { A2uiSurface } from "@a2ui/react/v0_9";
import { useA2UIProcessor } from "@/hooks/useA2UIProcessor";
import { useChatStream } from "@/hooks/useChatStream";
import {
  ChatHeader,
  EmptyState,
  UserMessageBubble,
  TypingIndicator,
  TextMessageBubble,
  StreamingBubble,
  ToolStatusIndicator,
  ChatInput,
} from "./chat";

export function A2UIChat() {
  const [input, setInput] = useState("");
  const { surfaces, processMessages } = useA2UIProcessor();
  const {
    userMessages,
    textMessages,
    streamingText,
    metrics,
    isLoading,
    error,
    toolStatus,
    sendMessage,
  } = useChatStream({
    onA2UIMessage: (msg) => processMessages([msg]),
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [userMessages, textMessages, streamingText, surfaces, scrollToBottom]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input;
    setInput("");
    await sendMessage(userMessage);
  };

  return (
    <div className="flex flex-col h-dvh bg-[var(--color-surface)]">
      <ChatHeader metrics={metrics} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 py-6 space-y-4">
          {userMessages.length === 0 && textMessages.length === 0 && !isLoading && !error && <EmptyState />}

          {error && (
            <div className="animate-fade-in-up rounded-[var(--radius-lg)] bg-[var(--color-danger-subtle)] border border-[var(--color-danger)]/20 px-4 py-3 text-sm text-[var(--color-danger)]">
              {error}
            </div>
          )}

          {userMessages.map((msg, i) => (
            <UserMessageBubble key={`user-${i}`} content={msg.content} index={i} />
          ))}

          {textMessages.map((msg, i) => (
            <TextMessageBubble key={`text-${i}`} content={msg.content} index={i} />
          ))}

          {streamingText && <StreamingBubble text={streamingText} />}

          {isLoading && !streamingText && <TypingIndicator />}

          {toolStatus && <ToolStatusIndicator status={toolStatus} />}

          {Array.from(surfaces.entries()).map(([surfaceId, surface]) => (
            <div key={surfaceId} className="animate-fade-in-up">
              <A2uiSurface surface={surface} />
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <ChatInput
        input={input}
        onInputChange={setInput}
        onSend={handleSend}
        isLoading={isLoading}
        metrics={metrics}
      />
    </div>
  );
}
