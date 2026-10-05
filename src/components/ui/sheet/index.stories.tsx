import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AmountField } from "@/components/ui/amount-field";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TextField } from "@/components/ui/text-field";

import { Sheet, SheetClose } from "./index";

const meta = {
  title: "Design system/Sheet",
  component: Sheet,
  args: {
    title: "ثبت تراکنش",
    trigger: <Button>ثبت تراکنش</Button>,
    children: (
      <>
        <SegmentedControl
          fullWidth
          aria-label="نوع تراکنش"
          options={[
            { value: "expense", label: "هزینه", tone: "expense" },
            { value: "income", label: "درآمد", tone: "income" },
            { value: "transfer", label: "انتقال", tone: "transfer" },
          ]}
        />
        <Field label="مبلغ" required>
          <AmountField showEquivalent />
        </Field>
        <Field label="شرح" optional>
          <TextField placeholder="مثلاً خرید هفتگی" />
        </Field>
      </>
    ),
    footer: (
      <>
        <SheetClose>
          <Button variant="secondary">انصراف</Button>
        </SheetClose>
        <Button>ثبت هزینه</Button>
      </>
    ),
  },
  argTypes: { trigger: { control: false } },
  parameters: { viewport: { defaultViewport: "mobile1" } },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Swipe the sheet down (or press Escape) to close it. */
export const AddTransaction: Story = {};

export const OpenOnLoad: Story = { args: { defaultOpen: true } };
