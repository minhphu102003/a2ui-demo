import { z } from "zod";
import { Catalog } from "@a2ui/web_core/v0_9";
import {
  createComponentImplementation,
  basicCatalog,
  type ReactComponentImplementation,
  type ReactA2uiComponentProps,
} from "@a2ui/react/v0_9";

const CourseCardApi = {
  name: "CourseCard",
  schema: z.object({
    title: z.string(),
    instructor: z.string(),
    thumbnail: z.string(),
    description: z.string(),
    action: z
      .object({
        name: z.string(),
        context: z.object({ url: z.string() }),
      })
      .optional(),
  }),
};

function CourseCardRenderer({
  props,
}: ReactA2uiComponentProps<z.infer<typeof CourseCardApi.schema>>) {
  return (
    <div className="group relative">
      <div className="rounded-[var(--radius-xl)] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] p-1.5 shadow-[var(--shadow-diffused)] transition-all duration-[var(--duration-slow)] ease-[var(--ease-spring)] hover:shadow-[var(--shadow-lifted)] hover:-translate-y-1">
        <div className="rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-surface)]">
          {props.thumbnail && (
            <div className="relative h-44 overflow-hidden">
              <img
                src={props.thumbnail}
                alt={props.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-[var(--ease-smooth)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          )}
          <div className="p-5">
            <h3 className="text-base font-semibold tracking-tight text-[var(--color-text-primary)] leading-snug mb-1.5">
              {props.title}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-3">
              {props.instructor}
            </p>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed line-clamp-2">
              {props.description}
            </p>
            {props.action && (
              <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
                <button className="group/btn inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-full)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)] text-sm font-medium hover:bg-[var(--color-accent)] hover:text-white active:scale-[0.98] transition-all duration-[var(--duration-normal)] ease-[var(--ease-spring)]">
                  {props.action.name}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-[var(--duration-normal)] ease-[var(--ease-spring)] group-hover/btn:translate-x-0.5">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const CourseCard = createComponentImplementation(
  CourseCardApi,
  CourseCardRenderer
);

export const courseCatalog = new Catalog<ReactComponentImplementation>(
  "course-catalog",
  [...basicCatalog.components.values(), CourseCard]
);
