# CLAUDE.md

Guidance for Claude Code / CLI when working in this repository. This file is the
source of truth for conventions — when in doubt, follow this over inferring from
surrounding code.

## Project

A local-first personal finance and budgeting app. No backend. All data lives in
IndexedDB via Dexie. Built as a portfolio piece — code quality, accessibility,
and design polish matter as much as functionality.

## Stack

- Vite + React + TypeScript
- Dexie (IndexedDB) — primary data layer, `useLiveQuery` for reactive reads
- Zustand — ONLY for ephemeral UI state that isn't persisted data (e.g. active
  modal, selected date range in a picker). If it can be derived from Dexie via
  `useLiveQuery`, it does not belong in a store.
- Zod — schema validation for CSV import, form input, and Dexie table shapes
- Radix UI primitives (unstyled) — for Dialog, Select, Popover, Tooltip, Tabs,
  and the Jalali date picker. Never import Radix's or any library's prebuilt
  _styled_ components (e.g. shadcn). Compose Radix primitives and style them
  from scratch in CSS Modules.
- CSS Modules + CSS custom properties for design tokens. No Tailwind, no
  CSS-in-JS, no third-party styled component kits.
- Vitest + React Testing Library (globals enabled, jsdom environment; setup
  file at `src/test/setup.ts`)
- react-router-dom — one route per top-level screen, each backed by a folder
  under `src/pages/`

## Folder structure & co-location

```
src/
  app.tsx          <- root component: applies theme/locale, owns the route table
  components/
    index.ts        <- barrel: app-specific components (public API only)
    empty-state/
    theme-toggle/
    locale-toggle/
    transaction-row/
    primitives/
      index.ts      <- barrel: generic, reusable, no business logic
      button/
        index.tsx
        styles.module.css
        spec.test.tsx
  pages/
    design-system/
      index.tsx      <- exports `<Name>Page`, wired into app.tsx's <Routes>
      styles.module.css
      spec.test.tsx
  features/
    transactions/
      components/
      hooks/
      db/          <- Dexie table schema + queries for this feature
      transactions.test.ts
  db/
    schema.ts      <- Dexie database + version definitions
  i18n/
    index.ts       <- barrel: useTranslation + re-exports formatAmount/formatNumber
    format.ts
    locales/
  stores/
    index.ts       <- barrel: Zustand stores, one file per store, only if justified
  styles/
    tokens.css     <- design tokens (colors, spacing, type scale, radii)
    theme-light.css / theme-dark.css
    fonts.css      <- self-hosted @font-face declarations
  test/
    setup.ts       <- Vitest setup (jest-dom matchers)
```

Component folders use lowercase names with generic, predictable file names
(`index.tsx`, `styles.module.css`, `spec.test.tsx`) rather than repeating the
component name in each filename. Co-locate tests, styles, and types next to
the component/feature that owns them. Shared/cross-feature code only lives in
top-level `components/`, `db/`, `styles/`.

`components/primitives/` holds generic, reusable, unstyled-in-isolation
building blocks (Button, Input, Card, Badge, Switch) with no dependency on
stores, i18n, or app-specific data shapes. `components/` (top level) holds
app-specific composed components that _may_ depend on stores/i18n
(ThemeToggle, TransactionRow, etc.). `pages/` holds one folder per route,
each exporting a single `<Name>Page` component consumed by `app.tsx`.

Components use named exports, never `export default`. A component's own
prop type is not exported — it's only ever consumed inside the file that
declares it, so name it plainly `Props` (not `ButtonProps`) rather than
exporting a type nothing outside the file uses.

**Event handlers**: a callback _prop_ is named `onX` (e.g. `onSave`,
`onAction`) — matching native DOM/React event prop naming, so components
compose the same way native elements do. A _local_ function that implements
the behavior (and optionally calls the prop) is named `handleX` (e.g.
`handleSave`) — never the same identifier as the prop, so there's no
destructure/rename collision between the two. Don't invent a `handleX`
wrapper just to forward a prop unchanged — `<Button onClick={onAction}>` is
fine as-is; only name a local handler when there's real logic in it.

**Barrel exports**: any folder that groups multiple sibling modules
(`components/`, `components/primitives/`, `stores/`, `i18n/`) gets an
`index.ts` re-exporting its public API — components/hooks/functions actually
consumed elsewhere, never internal-only prop types. Keep `components/` and
`components/primitives/` as two separate barrels rather than one re-exporting
the other, so every export has exactly one import path.

**Path aliases**: `@/*` maps to `./src/*`, declared in _both_
`tsconfig.app.json` (`compilerOptions.paths`, no `baseUrl` — this TS version
deprecates it, paths resolve relative to the tsconfig file itself) and
`vite.config.ts` (`resolve.alias`). These are two independent tools: the
tsconfig entry only affects the type-checker/editor, the Vite entry is what
actually resolves imports at dev/build time (and Vitest inherits it since
it's built on Vite) — both must be kept in sync by hand. Use `@/...` for any
import that would otherwise need `../` traversal; same-directory/sibling
imports stay relative.

## Design tokens & theming

- All colors, spacing, radii, shadows, font sizes are CSS custom properties in
  `styles/tokens.css`, overridden per-theme in `theme-light.css` / `theme-dark.css`.
- System theme preference respected via `prefers-color-scheme`, with a manual
  override stored in `localStorage` (light/dark/system three-way toggle).
- Never hardcode a color or spacing value in a component's `.module.css` —
  always reference a token.
- Don't use the inline `style` prop for values that are the same on every
  render — give them a class in `styles.module.css` instead (see
  `pages/design-system` for the pattern: per-item loop values like a token name
  or a scale's pixel width stay inline since they can't be static classes;
  everything else, including one-off layout tweaks, becomes a named class).
  The one standing exception is a CSS custom property computed from a prop at
  runtime (e.g. `Badge` setting `--badge-hue`) — that's not expressible as a
  static class either.

**Color semantics — standing rules for every phase, not just Design System:**

- Positive/income amounts carry no dedicated hue — body text color plus a
  "+" prefix only. Only outflow/expense amounts get a color (the accent
  named "Rust" in the token set). Don't introduce a "positive" color.
- Category badge colors must never reuse the Rust/negative hue — a category
  tag should never visually compete with "this is a loss."
- Categories are user-created, so `Badge` takes an arbitrary hex `color`
  prop, not a fixed enum. Only the hex's _hue_ is used — background/text are
  the hue rendered against fixed per-theme saturation/lightness bands (see
  `--badge-*` tokens in `theme-light.css`/`theme-dark.css`), so every badge
  reads as one system regardless of the exact shade picked. Any hue landing
  within 15° of Rust's (~13°) is automatically nudged to the nearest safe
  edge, enforcing the rule above even for arbitrary user input — see
  `components/primitives/badge/hue.ts`.
- The interactive accent ("Brass") is reserved for buttons, focus rings, and
  links only — never reused for positive/negative semantics, so the two
  color systems can't collide.

## Typography & fonts

- **Manrope** (Latin) + **Dana** (Persian, variable font) — self-hosted, no
  external font CDN.
- Dana's axes, verified directly from the font file: `wght` (10–900,
  **default 10**) and `KASH` (0–100, default 0 — kashida/justification
  stretch, not a width axis; leave at default, not used in this app).
- **⚠️ Dana's default weight is 10 (Hairline), not 400.** Every element using
  Dana must set weight explicitly — never rely on the unset default, or text
  renders nearly invisible. Named instances line up with the type scale:
  Regular=400 (Body), Medium=500 (Numeric), DemiBold=600 (Display).
- **Dana has no standard `tnum` OpenType feature** (confirmed via the font's
  GSUB table). `font-variant-numeric: tabular-nums` does nothing on Dana —
  use `font-feature-settings: "ss03"` instead for tabular Persian numerals.
  Manrope does support `tnum`, so the numeric/tabular type role needs both
  mechanisms applied, one per script, not a single shared rule.
- **Never use Dana's `ss02` feature** (visually reskins Latin digit
  characters as Persian digit glyphs). It breaks copy-paste and
  screen-reader semantics. Persian digits must be real Persian digit
  characters, produced via `Intl.NumberFormat` with the correct locale — see
  Currency below.

```css
@font-face {
  font-family: 'Manrope';
  src:
    url('/fonts/manrope-variable.woff2') format('woff2-variations'),
    url('/fonts/manrope-variable.woff2') format('woff2');
  font-weight: 200 800;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Dana';
  src:
    url('/fonts/dana-variable.woff2') format('woff2-variations'),
    url('/fonts/dana-variable.woff2') format('woff2');
  font-weight: 10 900;
  font-style: normal;
  font-display: swap;
}
```

Both are woff2-only (universal browser support today) — no legacy `.woff`
fallback. See `styles/fonts.css`.

## i18n, RTL, calendars, currency

- Supported locales: `en` (LTR, Gregorian, USD/EUR), `fa` (RTL, Jalali, IRR).
- Use CSS logical properties (`margin-inline-start`, not `margin-left`, etc.)
  everywhere — never physical left/right properties — so RTL is automatic.
- `dir="rtl"`/`dir="ltr"` set at the document root based on active locale.
- Date handling: all dates stored in Dexie as ISO/Gregorian. Convert to Jalali
  only at the display layer via the Jalali plugin. Never store Jalali dates.
- Currency: store amounts as integer minor units (cents/rials, IRR uses 0 as
  its practical minor-unit exponent) in Dexie. Format for display via
  `Intl.NumberFormat` per active locale/currency, never by hand-building
  strings. This is also the only correct source of Persian digit characters
  — never produce them via a font feature (see Typography).
- `Intl.NumberFormat`'s currency symbol depends on the browser's _locale_
  data, not just the currency code — e.g. IRR renders as the code
  (`IRR 12,400,000`) under `en-US` and as the spelled-out word `ریال` under
  `fa-IR`, never a `﷼` glyph, in every browser tested. This is correct,
  expected `Intl` behavior for these locales, not a bug — don't hand-build a
  `﷼` symbol to "fix" it, that would violate the rule above.

## State management rules

1. Default to `useLiveQuery` reading directly from Dexie.
2. Reach for Zustand only for state with no natural persisted home (UI-only,
   session-only). Justify each store's existence in a comment at its top.

## App shell & navigation

- Two independent, non-overlapping mechanisms govern the sidebar:
  a user-toggled `sidebarCollapsed` (Zustand `ui-store`, persisted) that
  shrinks the desktop sidebar to a 64px icon-only rail, and a
  `useMobileViewport` (640px) breakpoint in `AppShell` that swaps the
  sidebar out entirely for a bottom tab bar (`BottomNav`) plus a floating
  `AddTransactionFab`, matching the Claude Design mock's "bottom nav —
  mobile breakpoint" frame. These used to be the same mechanism (an
  auto-forced icon rail below 880px) until the Claude Design source was
  updated to replace that with the bottom-tab-bar pattern instead — the
  manual icon-rail collapse is now desktop/tablet-only and always shows its
  toggle button, since there's no forced-narrow case left that would hide it.
- The bottom tab bar (`BottomNav`) and the desktop sidebar (`SidebarNav`)
  share their nav item data (routes, labels, icon paths) from
  `components/nav-items.ts` rather than duplicating it, since the Claude
  Design source keeps the same four nav entries (icons included) across both
  layouts.
- Locale/theme controls live on a dedicated `/settings` page (`LocaleMenu` +
  `ThemeMenu`, restyled as fixed-size triggers instead of the `flex:1`
  half-width pair they were as sidebar-footer inhabitants — laid out on the
  page as label+hint rows inside a `Card`, one per setting), not inline in
  the sidebar — moved there, and the sidebar's "Add transaction" button
  removed entirely, per product feedback on the Claude Design preview
  rather than the design file itself, so there's no mock to match either
  change. The sidebar's nav list now ends with a single "Settings" link
  pinned to the bottom via `margin-top: auto`, styled with the exact same
  `.navItem`/`.navItemActive` classes as Dashboard/Transactions/Reports/
  Budgets (same active-state color treatment, same icon-rail collapse behavior)
  rather than a bespoke style, so it reads as a peer nav entry, not a
  separate footer widget. It is desktop-sidebar-only by request — it is
  deliberately **not** added to `BottomNav`/`nav-items.ts`, so mobile
  currently has no way to reach Settings, and the mobile FAB is the only
  surviving "Add transaction" entry point (the desktop equivalent is gone).
  Revisit if mobile access to Settings becomes a real need.
- Neither the mobile bottom-tab-bar nor the desktop icon-rail expose
  locale/theme controls directly — on the icon rail the Settings link is
  still reachable (icon-only, same as the other nav items); on mobile
  there's no Settings entry at all (see above), so locale/theme are
  currently unreachable from a phone-width viewport.
- The brand wordmark is localized (`t.brand`: "Settle" / "پول") per the
  Claude Design RTL mock, which explicitly re-styles it in Dana at 17px
  rather than reusing the Latin wordmark's 16px. Only `SidebarNav` renders
  it — `BottomNav` has no brand mark in the design, matching a typical
  mobile tab bar.
- `LocaleMenu`/`ThemeMenu` (compact `DropdownMenu`-based triggers, now used
  on the Settings page) are intentionally separate components from
  `LocaleToggle`/`ThemeToggle` (segmented `RadioGroup` controls used on the
  Design System reference page) — popover-menu and inline-segmented-control
  are different interaction patterns, not variants of one component.

## Testing

- Every component gets a co-located `.test.tsx` covering rendered states and
  key interactions (not implementation details).
- Every Dexie query/mutation module gets a co-located `.test.ts`.
- Run the full suite before every commit.
- `npm run test:coverage` runs Vitest with the `@vitest/coverage-v8`
  provider (text + HTML reporters; HTML output goes to `coverage/`, which is
  gitignored). Barrel files (`components/index.ts`,
  `components/primitives/index.ts`, `stores/index.ts`, `i18n/index.ts`) are
  excluded by explicit path, not a `**/index.ts` glob — that glob also
  matches `index.tsx` component entry files and silently drops them from
  the report.

## Git & commits

- One feature phase per branch (e.g. `feature/transactions`, `feature/dashboard`).
- Conventional commit style: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`.
- Merge only after tests pass and the phase's Claude Design import is fully
  implemented.
- Never run `git commit` without the user's explicit go-ahead first — this
  holds even in auto/yolo mode, where committing is otherwise not something
  to wait on for lower-stakes actions. Finish and verify the work, then ask.

## Design spec workflow (Claude Design ↔ Claude Code sync)

Each feature phase is designed in Claude Design first, then handed to Claude
Code via the native "Send to Claude Code" feature (`claude_design` MCP,
`https://api.anthropic.com/v1/design/mcp`), which imports the live design
project directly by URL. There is no hand-maintained spec file per feature —
the imported `.dc.html` project _is_ the spec, so it can't drift out of sync
with what was actually designed.

If implementation surfaces a decision the design doesn't cover — a technical
constraint, an accessibility requirement, a font/library quirk discovered
along the way — record it directly in the relevant section of this file, so
`CLAUDE.md` stays the single source of truth for anything not visible in the
design itself.

## Phase order

1. Design System (tokens, theming, i18n/RTL scaffold, base primitives)
2. App shell & navigation (locale + theme switcher wired in) — `react-router-dom`
   and the `app.tsx` route table already exist from the Design System phase (a
   single `/design-system` route hosting the token/primitive reference); this
   phase is the actual navigation chrome and additional routes, not initial
   router setup
3. Transactions (CRUD, list/table)
4. Dashboard
5. Reports
6. Budgeting
7. Import/Export (incl. CSV)
8. Backup & sync (Google Drive, iCloud export)
