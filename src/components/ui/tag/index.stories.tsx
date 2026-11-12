import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { Tag } from "./index";
import { sample } from "@/helpers/sample";

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
          {sample("خوراک")}
        </Tag>
        <Tag
          color="sky"
          selected={selected.includes("transport")}
          onSelectedChange={toggle("transport")}
        >
          {sample("حمل و نقل")}
        </Tag>
        <Tag
          color="teal"
          selected={selected.includes("home")}
          onSelectedChange={toggle("home")}
        >
          {sample("خانه")}
        </Tag>
        <Tag color="violet" disabled onSelectedChange={() => {}}>
          {sample("اشتراک‌ها")}
        </Tag>
      </div>
    );
  },
};

/** Tags on a transaction can be removed. */
export const Removable: Story = {
  render: function Example() {
    const [tags, setTags] = useState([
      sample("سفر شمال"),
      sample("مهمانی"),
      sample("قسطی"),
    ]);
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
      {
        name: sample("خوراک"),
        color: "orange",
        title: sample("همراه با ۲ زیردسته"),
      },
      {
        name: sample("حمل‌ونقل"),
        color: "sky",
        title: sample("همراه با ۲ زیردسته"),
      },
      { name: sample("پوشاک"), color: "pink", title: sample("بدون زیردسته") },
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
