import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { Tag } from "./index";

const meta = {
  title: "Design system/Tag",
  component: Tag,
  args: { children: "سفر شمال", disabled: false },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Filter chips toggle (aria-pressed). */
export const Filters: Story = {
  render: function Example() {
    const [selected, setSelected] = useState(["food"]);
    const toggle = (key: string) => (on: boolean) =>
      setSelected(
        on ? [...selected, key] : selected.filter((item) => item !== key),
      );
    return (
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        <Tag
          color="orange"
          selected={selected.includes("food")}
          onSelectedChange={toggle("food")}
        >
          خوراک
        </Tag>
        <Tag
          color="sky"
          selected={selected.includes("transport")}
          onSelectedChange={toggle("transport")}
        >
          حمل و نقل
        </Tag>
        <Tag
          color="teal"
          selected={selected.includes("home")}
          onSelectedChange={toggle("home")}
        >
          خانه
        </Tag>
        <Tag color="violet" disabled onSelectedChange={() => {}}>
          اشتراک‌ها
        </Tag>
      </div>
    );
  },
};

/** Tags on a transaction can be removed. */
export const Removable: Story = {
  render: function Example() {
    const [tags, setTags] = useState(["سفر شمال", "مهمانی", "قسطی"]);
    return (
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        {tags.map((tag) => (
          <Tag
            key={tag}
            onRemove={() => setTags(tags.filter((item) => item !== tag))}
          >
            {tag}
          </Tag>
        ))}
      </div>
    );
  },
};

/** Suggestions: each tag adds itself with one click (the categories page's starters). */
export const Suggestions: Story = {
  render: function Example() {
    const [added, setAdded] = useState<string[]>([]);
    const suggestions = [
      { name: "خوراک", color: "orange", title: "همراه با ۲ زیردسته" },
      { name: "حمل‌ونقل", color: "sky", title: "همراه با ۲ زیردسته" },
      { name: "پوشاک", color: "pink", title: "بدون زیردسته" },
    ] as const;
    return (
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        {suggestions
          .filter((suggestion) => !added.includes(suggestion.name))
          .map((suggestion) => (
            <Tag
              key={suggestion.name}
              color={suggestion.color}
              icon={PlusIcon}
              title={suggestion.title}
              onClick={() => setAdded([...added, suggestion.name])}
            >
              {suggestion.name}
            </Tag>
          ))}
      </div>
    );
  },
};
