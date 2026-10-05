import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AddTransactionButton } from "@/components/add-transaction";
import { PageHeader } from "@/components/page-header";
import { PagePlaceholder } from "@/components/page-placeholder";
import { setSidebarCollapsed } from "@/utils/sidebar";

import { AppShell } from "./index";

const meta = {
  title: "Components/AppShell",
  component: AppShell,
  args: {
    user: { name: "مریم احمدی", role: "admin" },
    // Signing out calls a Server Action in the app; here it does nothing.
    onSignOut: async () => {},
    children: (
      <>
        <PageHeader
          title="تراکنش‌ها"
          subtitle="مهر ۱۴۰۵"
          actions={<AddTransactionButton />}
        />
        <PagePlaceholder section="transactions" />
      </>
    ),
  },
  argTypes: { children: { control: false } },
  parameters: {
    layout: "fullscreen",
    // The App Router mock's current path marks the active link.
    nextjs: { navigation: { pathname: "/transactions" } },
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Admins see user management in the sidebar and can add transactions. */
export const Admin: Story = {};

/** Editors can add transactions but don't manage users. */
export const Editor: Story = {
  args: { user: { name: "رضا کریمی", role: "editor" } },
};

/** Viewers only read: no add-transaction buttons. */
export const Viewer: Story = {
  args: {
    user: { name: "سارا محمدی", role: "viewer" },
    children: (
      <>
        <PageHeader title="تراکنش‌ها" subtitle="مهر ۱۴۰۵" />
        <PagePlaceholder section="transactions" />
      </>
    ),
  },
};

/** The sidebar collapsed to an icon rail; labels show as tooltips. */
export const Collapsed: Story = {
  beforeEach: () => {
    setSidebarCollapsed(true);
    return () => setSidebarCollapsed(false);
  },
};

/** Phones: top bar, bottom tab bar and the floating add button. */
export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

/** Settings isn't a tab: the phone top bar offers a way back. */
export const MobileSettings: Story = {
  args: {
    children: (
      <PageHeader title="تنظیمات" subtitle="پروفایل، رمز عبور و نمایش" />
    ),
  },
  parameters: { nextjs: { navigation: { pathname: "/settings" } } },
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

export const MobileViewer: Story = {
  args: Viewer.args,
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
