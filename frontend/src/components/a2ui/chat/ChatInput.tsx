import { useRef } from "react";
import type { MetricsMessage } from "@/hooks/useChatStream";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  metrics: MetricsMessage | null;
}

export function ChatInput({
  input,
  onInputChange,
  onSend,
  isLoading,
  metrics,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <footer className="glass-heavy border-t border-[var(--color-border-subtle)] px-4 sm:px-6 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about courses..."
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-[var(--radius-full)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[15px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:shadow-[var(--shadow-glow)] transition-all duration-[var(--duration-normal)] ease-[var(--ease-smooth)] disabled:opacity-50"
            />
          </div>
          <button
            onClick={onSend}
            disabled={isLoading || !input.trim()}
            className="group flex items-center justify-center w-11 h-11 rounded-[var(--radius-full)] bg-[var(--color-accent)] text-white shadow-[var(--shadow-lifted)] hover:bg-[var(--color-accent-hover)] hover:shadow-[var(--shadow-glow)] active:scale-[0.95] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[var(--color-accent)] disabled:hover:shadow-[var(--shadow-lifted)] transition-all duration-[var(--duration-normal)] ease-[var(--ease-spring)]"
          >
            {isLoading ? (
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-[var(--duration-normal)] ease-[var(--ease-spring)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
        {metrics && (
          <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-[var(--color-text-muted)]">
            <span>{metrics.latency_ms}ms</span>
            <span className="text-[var(--color-border)]">/</span>
            <span>in: {metrics.tokens.input}</span>
            <span className="text-[var(--color-border)]">/</span>
            <span>out: {metrics.tokens.output}</span>
          </div>
        )}
      </div>
    </footer>
  );
}
