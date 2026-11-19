import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Component tests (jsdom): jest-dom matchers, and an empty document after each test.
afterEach(() => cleanup());
