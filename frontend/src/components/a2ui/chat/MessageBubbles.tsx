interface TextMessageBubbleProps {
  content: string;
  index: number;
}

export function TextMessageBubble({ content, index }: TextMessageBubbleProps) {
  return (
    <div
      className="animate-fade-in-up rounded-[var(--radius-lg)] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] px-5 py-4 shadow-[var(--shadow-diffused)]"
      style={{ animationDelay: `${Math.min(index * 50, 200)}ms` }}
    >
      <p className="text-[15px] leading-relaxed text-[var(--color-text-primary)]">
        {content}
      </p>
    </div>
  );
}

interface StreamingBubbleProps {
  text: string;
}

export function StreamingBubble({ text }: StreamingBubbleProps) {
  return (
    <div className="animate-fade-in-up rounded-[var(--radius-lg)] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] px-5 py-4 shadow-[var(--shadow-diffused)]">
      <p className="text-[15px] leading-relaxed text-[var(--color-text-primary)]">
        {text}
        <span className="inline-block w-[2px] h-[1em] bg-[var(--color-accent)] ml-0.5 align-text-bottom animate-pulse-subtle" />
      </p>
    </div>
  );
}

interface ToolStatusProps {
  status: string;
}

export function ToolStatusIndicator({ status }: ToolStatusProps) {
  return (
    <div className="animate-fade-in-up flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)] bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/10">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-[pulse-subtle_1.4s_ease-in-out_infinite]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-[pulse-subtle_1.4s_ease-in-out_0.2s_infinite]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-[pulse-subtle_1.4s_ease-in-out_0.4s_infinite]" />
      </div>
      <span className="text-sm font-medium text-[var(--color-accent)]">
        {status}
      </span>
    </div>
  );
}
