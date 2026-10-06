import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { UserList, UserListSkeleton } from "./index";
import { SAMPLE_ADMIN_ID, SAMPLE_USERS } from "./sample-users";

const meta = {
  title: "Components/UserList",
  component: UserList,
  args: {
    users: SAMPLE_USERS,
    currentUserId: SAMPLE_ADMIN_ID,
    onNewUser: () => {},
    onResetPassword: () => {},
    onChangeRole: () => {},
    onDisable: () => {},
    onEnable: () => {},
  },
  argTypes: { users: { control: false } },
} satisfies Meta<typeof UserList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A table where there is room. Your own row's menu disables what you can't do to yourself. */
export const Default: Story = {};

/** Only the signed-in admin so far. */
export const Empty: Story = { args: { users: SAMPLE_USERS.slice(0, 1) } };

/** Cards on narrow screens. */
export const Phone: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

export const Loading: Story = { render: () => <UserListSkeleton /> };
