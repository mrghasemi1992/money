import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

import { resetViewport, stubBrowserApis } from "./browser";

// Component tests (jsdom): jest-dom matchers, the browser APIs jsdom lacks, and an empty
// document and a desktop viewport after each test.
stubBrowserApis();
beforeEach(() => resetViewport());
afterEach(() => cleanup());
