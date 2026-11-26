import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { REPORT_SECTION_PATHS } from "@/constants/report";
import { parseReportParams, reportParamsToSearch } from "@/helpers/report";
import { t } from "@/test/messages";
import { renderWithApp } from "@/test/render";

import { ReportTabs } from "./index";

const SEARCH = new URLSearchParams("period=3m");

vi.mock("next/navigation", () => ({
  useSearchParams: () => SEARCH,
}));

const href = (path: string) =>
  `${path}${reportParamsToSearch(parseReportParams(SEARCH))}`;

describe("ReportTabs", () => {
  it("links the three sections in order, keeping the period in every href", () => {
    renderWithApp(<ReportTabs section="overview" />);

    expect(
      screen.getByRole("navigation", { name: t("reports.tabs.label") }),
    ).toBeInTheDocument();

    const names = ["overview", "breakdown", "trends"] as const;
    const links = names.map((section) =>
      screen.getByRole("link", { name: t(`reports.tabs.${section}`) }),
    );
    links.forEach((link, index) =>
      expect(link).toHaveAttribute(
        "href",
        href(REPORT_SECTION_PATHS[names[index]!]),
      ),
    );
  });

  it("marks the section shown with aria-current and the others not", () => {
    renderWithApp(<ReportTabs section="breakdown" />);

    expect(
      screen.getByRole("link", {
        name: t("reports.tabs.breakdown"),
        current: "page",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", {
        name: t("reports.tabs.overview"),
        current: "page",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", {
        name: t("reports.tabs.trends"),
        current: "page",
      }),
    ).not.toBeInTheDocument();
  });
});
