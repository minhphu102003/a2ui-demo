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
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {props.thumbnail && (
        <img
          src={props.thumbnail}
          alt={props.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{props.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{props.instructor}</p>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
          {props.description}
        </p>
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
