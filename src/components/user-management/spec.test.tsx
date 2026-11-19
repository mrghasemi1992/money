import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  SAMPLE_ADMIN_ID,
  SAMPLE_USERS,
} from "@/components/user-list/sample-users";
import { t } from "@/test/messages";
import { findToast, startsWith } from "@/test/queries";
import { renderWithApp } from "@/test/render";

import { UserManagement } from "./index";

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings/users",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

const byName = (name: string) =>
  SAMPLE_USERS.find((user) => user.name === name)!;
const self = SAMPLE_USERS.find((user) => user.id === SAMPLE_ADMIN_ID)!;
const otherAdmin = SAMPLE_USERS.find(
  (user) => user.role === "admin" && user.id !== SAMPLE_ADMIN_ID,
)!;
const editor = byName("مریم صادقی");
const disabled = SAMPLE_USERS.find((user) => user.disabled)!;

const ok = () => vi.fn().mockResolvedValue({ ok: true });

function setup(props: Partial<Parameters<typeof UserManagement>[0]> = {}) {
  const handlers = {
    onGeneratePassword: vi.fn().mockResolvedValue("kT7m-Qx4p-Wz9r"),
    onCreate: ok(),
    onResetPassword: vi
      .fn()
      .mockResolvedValue({ ok: true, password: "Hn3c-v8Ra-pW2x" }),
    onChangeRole: ok(),
    onDisable: ok(),
    onEnable: ok(),
  };
  renderWithApp(
    <UserManagement
      users={SAMPLE_USERS}
      currentUserId={SAMPLE_ADMIN_ID}
      {...handlers}
      {...props}
    />,
  );
  return { ...handlers, user: userEvent.setup() };
}

/** Opens a user's row menu (the list has a table and phone cards; either works). */
async function openMenu(
  user: ReturnType<typeof userEvent.setup>,
  name: string,
) {
  const [trigger] = screen.getAllByRole("button", {
    name: t("users.menu", { name }),
  });
  await user.click(trigger!);
  return screen.findByRole("menu");
}

describe("UserManagement", () => {
  it("creates a user with the generated temporary password", async () => {
    const { user, onCreate } = setup();

    await user.click(
      screen.getAllByRole("button", { name: t("users.newUser") })[0]!,
    );
    const dialog = await screen.findByRole("dialog", {
      name: t("users.form.title"),
    });
    await user.type(
      within(dialog).getByRole("textbox", { name: t("users.form.name") }),
      "سارا رحیمی",
    );
    await user.type(
      within(dialog).getByRole("textbox", {
        name: startsWith(t("users.form.username")),
      }),
      "sara.rahimi",
    );
    await user.click(
      within(dialog).getByRole("button", { name: t("users.form.submit") }),
    );

    expect(onCreate).toHaveBeenCalledWith({
      name: "سارا رحیمی",
      username: "sara.rahimi",
      password: "kT7m-Qx4p-Wz9r",
      role: "viewer",
      locale: "fa",
    });
    expect(
      await findToast(t("users.toasts.created", { name: "سارا رحیمی" })),
    ).toBeInTheDocument();
  });

  it("names the role and language groups, and each option by itself", async () => {
    const { user, onCreate } = setup();

    await user.click(
      screen.getAllByRole("button", { name: t("users.newUser") })[0]!,
    );
    const dialog = await screen.findByRole("dialog", {
      name: t("users.form.title"),
    });
    expect(
      within(dialog).getByRole("radiogroup", { name: t("users.form.role") }),
    ).toBeInTheDocument();
    const language = within(dialog).getByRole("radiogroup", {
      name: t("users.form.language"),
    });
    expect(language).toHaveAccessibleDescription(t("users.form.languageHint"));

    await user.click(
      within(dialog).getByRole("radio", { name: startsWith(t("role.editor")) }),
    );
    await user.click(within(language).getByRole("radio", { name: "English" }));
    await user.type(
      within(dialog).getByRole("textbox", { name: t("users.form.name") }),
      "David",
    );
    await user.type(
      within(dialog).getByRole("textbox", {
        name: startsWith(t("users.form.username")),
      }),
      "david.m2",
    );
    await user.click(
      within(dialog).getByRole("button", { name: t("users.form.submit") }),
    );

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ role: "editor", locale: "en" }),
    );
  });

  it("shows a taken username on its field", async () => {
    const { user } = setup({
      onCreate: vi.fn().mockResolvedValue({
        ok: false,
        field: "username",
        error: t("users.form.errors.usernameTaken"),
      }),
    });

    await user.click(
      screen.getAllByRole("button", { name: t("users.newUser") })[0]!,
    );
    const dialog = await screen.findByRole("dialog");
    await user.type(
      within(dialog).getByRole("textbox", { name: t("users.form.name") }),
      "Sara",
    );
    await user.type(
      within(dialog).getByRole("textbox", {
        name: startsWith(t("users.form.username")),
      }),
      "sara.r",
    );
    await user.click(
      within(dialog).getByRole("button", { name: t("users.form.submit") }),
    );

    expect(
      await within(dialog).findByText(t("users.form.errors.usernameTaken")),
    ).toBeInTheDocument();
  });

  it("changes an editor's role straight away", async () => {
    const { user, onChangeRole } = setup();

    const menu = await openMenu(user, editor.name);
    await user.click(
      within(menu).getByRole("menuitem", {
        name: t("users.actions.changeRole"),
      }),
    );
    await user.click(
      await screen.findByRole("radio", { name: startsWith(t("role.viewer")) }),
    );
    await user.click(
      screen.getByRole("button", { name: t("users.role.submit") }),
    );

    expect(onChangeRole).toHaveBeenCalledWith({
      userId: editor.id,
      role: "viewer",
    });
    expect(await findToast(t("users.toasts.roleChanged"))).toBeInTheDocument();
  });

  it("asks once more before removing an admin's rights", async () => {
    const { user, onChangeRole } = setup();

    const menu = await openMenu(user, otherAdmin.name);
    await user.click(
      within(menu).getByRole("menuitem", {
        name: t("users.actions.changeRole"),
      }),
    );
    await user.click(
      await screen.findByRole("radio", { name: startsWith(t("role.editor")) }),
    );
    await user.click(
      screen.getByRole("button", { name: t("users.role.submit") }),
    );

    expect(onChangeRole).not.toHaveBeenCalled();
    await user.click(
      await screen.findByRole("button", { name: t("users.demote.submit") }),
    );
    expect(onChangeRole).toHaveBeenCalledWith({
      userId: otherAdmin.id,
      role: "editor",
    });
  });

  it("doesn't let the admin change, reset or disable their own account", async () => {
    const { user } = setup();

    const menu = await openMenu(user, self.name);
    for (const action of ["resetPassword", "changeRole", "disable"] as const) {
      expect(
        within(menu).getByRole("menuitem", {
          name: startsWith(t(`users.actions.${action}`)),
        }),
      ).toHaveAttribute("aria-disabled", "true");
    }
  });

  it("disables a user after confirming, with an undo that enables them again", async () => {
    const { user, onDisable, onEnable } = setup();

    const menu = await openMenu(user, editor.name);
    await user.click(
      within(menu).getByRole("menuitem", { name: t("users.actions.disable") }),
    );
    await user.click(
      await screen.findByRole("button", { name: t("users.disable.submit") }),
    );
    expect(onDisable).toHaveBeenCalledWith({ userId: editor.id });

    const toast = await findToast(t("users.toasts.disabled"));
    await user.click(
      within(toast).getByRole("button", {
        name: t("common.undo"),
        hidden: true,
      }),
    );
    expect(onEnable).toHaveBeenCalledWith({ userId: editor.id });
  });

  it("enables a disabled user from the menu", async () => {
    const { user, onEnable } = setup();

    const menu = await openMenu(user, disabled.name);
    await user.click(
      within(menu).getByRole("menuitem", { name: t("users.actions.enable") }),
    );
    expect(onEnable).toHaveBeenCalledWith({ userId: disabled.id });
  });

  it("resets a password after confirming and shows the new one once", async () => {
    const { user, onResetPassword } = setup();

    const menu = await openMenu(user, editor.name);
    await user.click(
      within(menu).getByRole("menuitem", {
        name: t("users.actions.resetPassword"),
      }),
    );
    await user.click(
      await screen.findByRole("button", { name: t("users.reset.submit") }),
    );

    expect(onResetPassword).toHaveBeenCalledWith({ userId: editor.id });
    expect(
      await screen.findByRole("dialog", { name: t("users.reset.shownTitle") }),
    ).toBeInTheDocument();
    expect(screen.getByText(t("users.reset.once"))).toBeInTheDocument();
    expect(screen.getAllByText("Hn3c-v8Ra-pW2x").length).toBeGreaterThan(0);
  });

  it("shows the server's refusal and keeps the dialog open", async () => {
    const { user } = setup({
      onDisable: vi
        .fn()
        .mockResolvedValue({ ok: false, error: t("users.lastAdmin") }),
    });

    const menu = await openMenu(user, editor.name);
    await user.click(
      within(menu).getByRole("menuitem", { name: t("users.actions.disable") }),
    );
    await user.click(
      await screen.findByRole("button", { name: t("users.disable.submit") }),
    );

    expect(await findToast(t("users.lastAdmin"))).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: t("users.disable.submit") }),
    ).toBeInTheDocument();
  });
});
