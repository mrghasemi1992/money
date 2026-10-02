import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/ui/button";

import { useToast, type ToastTone } from "./index";

function ToastDemo() {
  const toast = useToast();
  const examples: {
    tone: ToastTone;
    label: string;
    title: string;
    description?: string;
  }[] = [
    {
      tone: "success",
      label: "موفق",
      title: "تراکنش ثبت شد",
      description: "خرید هفتگی، ۸۵۰٬۰۰۰ ریال",
    },
    { tone: "info", label: "اطلاع", title: "۳ تراکنش از Claude رسید" },
    { tone: "warning", label: "هشدار", title: "بودجه خوراک نزدیک به سقف است" },
    {
      tone: "danger",
      label: "خطا",
      title: "تراکنش ثبت نشد",
      description: "اتصال به سرور برقرار نشد.",
    },
    { tone: "neutral", label: "ساده", title: "تغییرات ذخیره شد" },
  ];
  return (
    <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
      {examples.map(({ tone, label, title, description }) => (
        <Button
          key={tone}
          variant="secondary"
          onClick={() => toast.show({ tone, title, description })}
        >
          {label}
        </Button>
      ))}
      <Button
        onClick={() =>
          toast.show({
            tone: "success",
            title: "تراکنش حذف شد",
            description: "خرید هفتگی، ۸۵۰٬۰۰۰ ریال",
            action: {
              label: "واگرد",
              onClick: () => toast.show({ title: "تراکنش برگشت" }),
            },
          })
        }
      >
        حذف با واگرد
      </Button>
    </div>
  );
}

const meta = {
  title: "Design system/Toast",
  component: ToastDemo,
} satisfies Meta<typeof ToastDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Toasts confirm in past tense. Without an action they close after 5 s; with «واگرد» they stay. */
export const Tones: Story = {};
