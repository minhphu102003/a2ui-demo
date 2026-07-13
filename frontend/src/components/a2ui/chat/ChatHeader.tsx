import type { MetricsMessage } from "@/hooks/useChatStream";

interface ChatHeaderProps {
  metrics: MetricsMessage | null;
}

export function ChatHeader({ metrics }: ChatHeaderProps) {
  return (
    <header className="glass sticky top-0 z-40 w-full">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4 sm:px-10 sm:py-5">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-accent)] flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-[var(--color-text-primary)]">
              Course Catalog
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] font-mono">
              A2UI Agent
            </p>
          </div>
        </div>
        {metrics && (
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse-subtle" />
              {metrics.latency_ms}ms
            </span>
            <span className="text-[var(--color-border)]">|</span>
            <span>{metrics.tokens.total} tok</span>
          </div>
        )}
      </div>
    </header>
  );
}
