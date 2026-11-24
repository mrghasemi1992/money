import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { t } from "@/test/messages";
import { startsWith } from "@/test/queries";
import { renderWithApp } from "@/test/render";

import { AccountDialog } from "./index";

function setup(props: Partial<Parameters<typeof AccountDialog>[0]> = {}) {
  const handlers = {
    onOpenChange: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue({ ok: true }),
    onSaved: vi.fn(),
  };
  renderWithApp(<AccountDialog open account={null} {...handlers} {...props} />);
  return { ...handlers, user: userEvent.setup() };
}

const nameField = () =>
  screen.getByRole("textbox", { name: startsWith(t("accounts.form.name")) });
const cardNumberField = () =>
  screen.queryByRole("textbox", {
    name: startsWith(t("accounts.identifierKinds.cardNumber")),
  });
const typeOption = (type: "bank" | "cash") =>
  screen.getByRole("radio", { name: t(`accounts.types.${type}`) });
const submit = () =>
  screen.getByRole("button", { name: t("accounts.form.submitNew") });

describe("AccountDialog", () => {
  it("shows an invalid card number on its own field", async () => {
    const { user, onSubmit } = setup();

    await user.type(nameField(), "بانک ملی");
    await user.type(cardNumberField()!, "1234");
    await user.click(submit());

    expect(
      screen.getByText(t("accounts.form.errors.cardNumberInvalid")),
    ).toBeInTheDocument();
    expect(cardNumberField()).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("saves a cash account without the identifiers typed while it was a bank account", async () => {
    const { user, onSubmit } = setup();

    await user.type(nameField(), "کیف پول");
    await user.type(cardNumberField()!, "1234");
    await user.click(typeOption("cash"));
    expect(cardNumberField()).not.toBeInTheDocument();
    await user.click(submit());

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "cash",
        identifiers: { accountNumber: null, cardNumber: null, sheba: null },
      }),
    );
  });

  it("brings the typed identifiers back when the type returns to bank", async () => {
    const { user } = setup();

    await user.type(cardNumberField()!, "6037991234566219");
    await user.click(typeOption("cash"));
    await user.click(typeOption("bank"));

    expect(cardNumberField()).toHaveValue("6037991234566219");
  });
});
