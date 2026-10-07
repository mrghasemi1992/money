import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ListError, PageError, PageNotFound } from "./index";

const meta = {
  title: "Components/PageStatus",
  component: PageError,
  args: { onRetry: () => {} },
} satisfies Meta<typeof PageError>;

export default meta;
type Story = StoryObj<typeof meta>;

/** error.tsx: the page failed to load. «تلاش دوباره» loads it again. */
export const LoadFailed: Story = {};

/** not-found.tsx: unknown paths, and pages the viewer's role can't open. */
export const NotFound: Story = {
  render: () => <PageNotFound />,
};

/** A list page's error.tsx (accounts, categories): under the page header, with a retry. */
export const ListFailed: Story = {
  render: () => <ListError title="حساب‌ها بارگذاری نشد" onRetry={() => {}} />,
};
