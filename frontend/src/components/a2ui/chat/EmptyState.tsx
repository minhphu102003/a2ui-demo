export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
      <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-[var(--color-accent-subtle)] flex items-center justify-center mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)] mb-2">
        Find your next course
      </h2>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-[280px] leading-relaxed">
        Ask me about available courses, instructors, or topics you&apos;re interested in.
      </p>
    </div>
  );
}
