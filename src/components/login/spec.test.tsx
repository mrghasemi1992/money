import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import fa from "@/messages/fa";
import { server } from "@/test/msw";
import { renderWithApp } from "@/test/render";

import { Login } from "./index";

const router = { replace: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const SIGN_IN = "*/api/auth/sign-in/username";

async function signIn(username: string, password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(fa.login.username), username);
  await user.type(screen.getByLabelText(fa.login.password), password);
  await user.click(screen.getByRole("button", { name: fa.login.submit }));
}

describe("Login", () => {
  it("signs in and goes to the page the visitor asked for", async () => {
    let sent: unknown;
    server.use(
      http.post(SIGN_IN, async ({ request }) => {
        sent = await request.json();
        return HttpResponse.json({ token: "t" });
      }),
    );
    renderWithApp(<Login returnTo="/budgets" />);

    await signIn(" sara ", "pool-1405");

    expect(await screen.findByRole("status")).toHaveTextContent(
      fa.login.alerts.success,
    );
    expect(sent).toEqual({ username: "sara", password: "pool-1405" });
    expect(router.replace).toHaveBeenCalledWith("/budgets");
  });

  it("says only that the username or password is wrong, and clears the password", async () => {
    server.use(
      http.post(SIGN_IN, () =>
        HttpResponse.json(
          { code: "INVALID_USERNAME_OR_PASSWORD" },
          { status: 401 },
        ),
      ),
    );
    renderWithApp(<Login />);

    await signIn("sara", "wrong-password");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      fa.login.alerts.wrong,
    );
    const password = screen.getByLabelText(fa.login.password);
    expect(password).toHaveValue("");
    expect(password).toHaveFocus();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("tells a disabled user their account is off", async () => {
    server.use(
      http.post(SIGN_IN, () =>
        HttpResponse.json({ code: "BANNED_USER" }, { status: 403 }),
      ),
    );
    renderWithApp(<Login />);

    await signIn("reza", "pool-1405");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      fa.login.alerts.disabled,
    );
  });

  it("asks for the missing fields without sending anything", async () => {
    const requests = vi.fn();
    server.use(
      http.post(SIGN_IN, () => {
        requests();
        return HttpResponse.json({});
      }),
    );
    renderWithApp(<Login />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: fa.login.submit }));

    expect(screen.getByText(fa.login.usernameMissing)).toBeInTheDocument();
    expect(screen.getByLabelText(fa.login.username)).toHaveFocus();
    expect(requests).not.toHaveBeenCalled();
  });
});
