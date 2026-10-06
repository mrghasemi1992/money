import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import {
  SAMPLE_ADMIN_ID,
  SAMPLE_USERS,
} from "@/components/user-list/sample-users";
import type { ActionResult } from "@/types/action";
import type { ManagedUser, NewUserField, NewUserInput } from "@/types/user";

import { UserManagement, UserManagementSkeleton } from "./index";

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 500));
const ok = async (): Promise<ActionResult> => {
  await wait();
  return { ok: true };
};

const meta = {
  title: "Components/UserManagement",
  component: UserManagement,
  args: {
    users: SAMPLE_USERS,
    currentUserId: SAMPLE_ADMIN_ID,
    onGeneratePassword: async () => {
      await wait();
      return "kT7m-Qx4p-Wz9r";
    },
    onCreate: async (): Promise<ActionResult<NewUserField>> => {
      await wait();
      return { ok: true };
    },
    onResetPassword: async (): Promise<
      ActionResult<never, { password: string }>
    > => {
      await wait();
      return { ok: true, password: "Hn3c-v8Ra-pW2x" };
    },
    onChangeRole: ok,
    onDisable: ok,
    onEnable: ok,
  },
  argTypes: { users: { control: false } },
} satisfies Meta<typeof UserManagement>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The page with working fakes: create users, change roles, disable and enable, reset
 * passwords. Changes stay in the story, as the page's refresh would show them.
 */
export const Default: Story = {
  render: function Example(args) {
    const [users, setUsers] = useState(args.users);
    const patch = (userId: string, change: Partial<ManagedUser>) =>
      setUsers((current) =>
        current.map((user) =>
          user.id === userId ? { ...user, ...change } : user,
        ),
      );
    return (
      <UserManagement
        {...args}
        users={users}
        onCreate={async (input: NewUserInput) => {
          await wait();
          if (users.some((user) => user.username === input.username)) {
            return {
              ok: false,
              field: "username",
              error: "این نام کاربری قبلاً گرفته شده است.",
            };
          }
          setUsers((current) => [
            ...current,
            {
              id: crypto.randomUUID(),
              name: input.name.trim(),
              username: input.username.trim(),
              role: input.role,
              locale: input.locale,
              disabled: false,
              createdOn: "2026-10-06",
            },
          ]);
          return { ok: true };
        }}
        onChangeRole={async ({ userId, role }) => {
          await wait();
          patch(userId, { role });
          return { ok: true };
        }}
        onDisable={async ({ userId }) => {
          await wait();
          patch(userId, { disabled: true });
          return { ok: true };
        }}
        onEnable={async ({ userId }) => {
          await wait();
          patch(userId, { disabled: false });
          return { ok: true };
        }}
      />
    );
  },
};

/** Only the signed-in admin so far. */
export const Empty: Story = { args: { users: SAMPLE_USERS.slice(0, 1) } };

/** The server refuses a change: the error shows as a toast. */
export const ActionFails: Story = {
  args: {
    onChangeRole: async () => {
      await wait();
      return { ok: false, error: "دست‌کم یک مدیر فعال باید بماند." };
    },
    onDisable: async () => {
      await wait();
      return { ok: false, error: "دست‌کم یک مدیر فعال باید بماند." };
    },
  },
};

export const Phone: Story = {
  ...Default,
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

export const Loading: Story = { render: () => <UserManagementSkeleton /> };
