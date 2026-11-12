import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/ui/button";

import { useToast, type ToastTone } from "./index";
import { sample } from "@/helpers/sample";

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
      label: sample("موفق"),
      title: sample("تراکنش ثبت شد"),
      description: sample("خرید هفتگی، ۸۵۰٬۰۰۰ ریال"),
    },
    {
      tone: "info",
      label: sample("اطلاع"),
      title: sample("۳ تراکنش از Claude رسید"),
    },
    {
      tone: "warning",
      label: sample("هشدار"),
      title: sample("بودجه خوراک نزدیک به سقف است"),
    },
    {
      tone: "danger",
      label: sample("خطا"),
      title: sample("تراکنش ثبت نشد"),
      description: sample("اتصال به سرور برقرار نشد."),
    },
    {
      tone: "neutral",
      label: sample("ساده"),
      title: sample("تغییرات ذخیره شد"),
    },
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
            title: sample("تراکنش حذف شد"),
            description: sample("خرید هفتگی، ۸۵۰٬۰۰۰ ریال"),
            action: {
              label: sample("واگرد"),
              onClick: () => toast.show({ title: sample("تراکنش برگشت") }),
            },
          })
        }
      >
        {sample("حذف با واگرد")}
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

/** Toasts confirm in past tense and stack like a deck; hover to spread them out, swipe to dismiss. Without an action they close after 4 s, errors after 6 s, with «واگرد» after 8 s. */
export const Tones: Story = {};
