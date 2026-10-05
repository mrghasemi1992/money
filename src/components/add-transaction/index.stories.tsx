import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AddTransactionButton, AddTransactionProvider } from "./index";

const meta = {
  title: "Components/AddTransaction",
  component: AddTransactionProvider,
  args: { enabled: true, children: <AddTransactionButton /> },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof AddTransactionProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The page-header button (larger screens; phones use the tab bar's floating button). */
export const Button: Story = {};

/** The placeholder form until transactions arrive: a dialog on larger screens. */
export const Open: Story = { args: { defaultOpen: true } };

/** On phones, a bottom sheet. */
export const OpenOnPhone: Story = {
  args: { defaultOpen: true },
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

/** Viewers get no form, and the button renders nothing. */
export const Viewer: Story = { args: { enabled: false } };
