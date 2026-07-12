import { Catalog } from "@a2ui/web_core/v0_9";
import { createComponentImplementation, basicCatalog } from "@a2ui/react/v0_9";
import { CourseCard } from "@/components/a2ui/CourseCard";
import { Text, Button, Row, Column, Card, List, TextField } from "@/components/a2ui/overrides";

const courseCardApi = {
  name: "CourseCard",
  schema: {
    title: "string",
    instructor: "string",
    thumbnail: "string",
    description: "string",
    action: "optional",
  },
};

const courseCardImplementation = createComponentImplementation(
  courseCardApi,
  (props) => CourseCard(props as any)
);

export const courseCatalog = new Catalog({
  id: "course-catalog",
  components: {
    ...basicCatalog.components,
    CourseCard: courseCardImplementation,
    Text: createComponentImplementation(
      { name: "Text", schema: { children: "any", variant: "optional" } },
      (props) => Text(props as any)
    ),
    Button: createComponentImplementation(
      { name: "Button", schema: { children: "any", onClick: "optional", variant: "optional" } },
      (props) => Button(props as any)
    ),
    Row: createComponentImplementation(
      { name: "Row", schema: { children: "any", gap: "optional" } },
      (props) => Row(props as any)
    ),
    Column: createComponentImplementation(
      { name: "Column", schema: { children: "any", gap: "optional" } },
      (props) => Column(props as any)
    ),
    Card: createComponentImplementation(
      { name: "Card", schema: { children: "any" } },
      (props) => Card(props as any)
    ),
    List: createComponentImplementation(
      { name: "List", schema: { children: "any" } },
      (props) => List(props as any)
    ),
    TextField: createComponentImplementation(
      { name: "TextField", schema: { label: "optional", value: "optional", onChange: "optional", placeholder: "optional" } },
      (props) => TextField(props as any)
    ),
  },
});
