interface UserMessageBubbleProps {
  content: string;
  index: number;
}

export function UserMessageBubble({ content, index }: UserMessageBubbleProps) {
  return (
    <div
      className="animate-fade-in-up flex justify-end"
      style={{ animationDelay: `${Math.min(index * 50, 200)}ms` }}
    >
      <div className="max-w-[85%] sm:max-w-[75%] rounded-[var(--radius-xl)] bg-[var(--color-accent)] px-6 py-3.5 shadow-[var(--shadow-lifted)]">
        <p className="text-[15px] leading-relaxed text-[var(--color-text-inverse)]">
          {content}
        </p>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="animate-fade-in-up flex items-center gap-2 px-4 py-3">
      <div className="flex items-center gap-1.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] px-4 py-3 shadow-[var(--shadow-diffused)]">
        <span className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-[pulse-subtle_1.4s_ease-in-out_infinite]" />
        <span className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-[pulse-subtle_1.4s_ease-in-out_0.2s_infinite]" />
        <span className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-[pulse-subtle_1.4s_ease-in-out_0.4s_infinite]" />
      </div>
    </div>
  );
}

interface TextMessageBubbleProps {
  content: string;
  index: number;
}

export function TextMessageBubble({ content, index }: TextMessageBubbleProps) {
  return (
    <div
      className="animate-fade-in-up rounded-[var(--radius-lg)] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] px-6 py-4 shadow-[var(--shadow-diffused)]"
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
    <div className="animate-fade-in-up rounded-[var(--radius-lg)] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] px-6 py-4 shadow-[var(--shadow-diffused)]">
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
