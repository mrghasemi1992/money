"use client";

import {
  ArrowLeftRightIcon,
  CalendarIcon,
  PiggyBankIcon,
  ReceiptIcon,
  WalletIcon,
} from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { CATEGORY_COLORS } from "@/constants/category";

import styles from "./styles.module.css";

/*
 * Storybook-only documentation of the design system tokens. Not used by the app.
 * Every value is read from the live CSS, so it follows the theme toolbar.
 */

const RAMPS: Array<[name: string, steps: string[]]> = [
  [
    "royal",
    [
      "50",
      "100",
      "200",
      "300",
      "400",
      "500",
      "600",
      "700",
      "800",
      "900",
      "950",
    ],
  ],
  [
    "slate",
    [
      "0",
      "25",
      "50",
      "100",
      "200",
      "300",
      "400",
      "500",
      "600",
      "700",
      "800",
      "900",
      "950",
    ],
  ],
  ...[
    "green",
    "teal",
    "sky",
    "lime",
    "amber",
    "orange",
    "red",
    "pink",
    "violet",
    "brown",
  ].map(
    (hue) => [hue, ["100", "300", "500", "600", "dk"]] as [string, string[]],
  ),
];

const SEMANTIC: Array<
  [group: string, tokens: Array<[token: string, use: string]>]
> = [
  [
    "Surfaces",
    [
      ["--surface-page", "page"],
      ["--surface-card", "cards"],
      ["--surface-raised", "menus, dialogs"],
      ["--surface-sunken", "tracks, segmented"],
      ["--surface-inset", "sunken card"],
      ["--surface-hover", "row hover"],
      ["--surface-active", "row press"],
      ["--surface-selected", "selected item"],
      ["--surface-disabled", "disabled control"],
      ["--surface-brand", "balance card"],
      ["--surface-tooltip", "tooltip"],
      ["--surface-scrim", "modal backdrop"],
    ],
  ],
  [
    "Borders",
    [
      ["--border-subtle", "card edge (light)"],
      ["--border-default", "panels, dividers"],
      ["--border-strong", "checkbox, radio"],
      ["--border-input", "inputs"],
      ["--border-input-hover", "input hover"],
    ],
  ],
  [
    "Text",
    [
      ["--text-primary", "body"],
      ["--text-secondary", "labels"],
      ["--text-muted", "meta, captions"],
      ["--text-placeholder", "placeholder"],
      ["--text-disabled", "disabled"],
      ["--text-link", "links"],
      ["--text-on-brand", "on royal"],
    ],
  ],
  [
    "Brand",
    [
      ["--brand-solid", "primary fill"],
      ["--brand-solid-hover", "fill hover"],
      ["--brand-solid-active", "fill press"],
      ["--brand-soft", "tinted fill"],
      ["--brand-text", "royal text"],
      ["--brand-border", "tinted border"],
      ["--ring-color", "focus ring"],
    ],
  ],
  [
    "Status",
    [
      ["--status-success", "success"],
      ["--status-success-soft", "success fill"],
      ["--status-warning", "warning"],
      ["--status-warning-soft", "warning fill"],
      ["--status-danger", "danger"],
      ["--status-danger-soft", "danger fill"],
      ["--status-info", "info"],
      ["--status-info-soft", "info fill"],
    ],
  ],
  [
    "Money",
    [
      ["--amount-income", "income +"],
      ["--amount-expense", "expense −"],
      ["--amount-transfer", "transfer"],
      ["--amount-neutral", "balances"],
      ["--budget-ok", "budget ok"],
      ["--budget-near", "near limit"],
      ["--budget-over", "over budget"],
      ["--budget-track", "track"],
    ],
  ],
];

const TYPE_ROLES: Array<[role: string, sample: string]> = [
  ["display", "پول"],
  ["title-lg", "گزارش مهر ۱۴۰۵"],
  ["title", "بودجه‌های این ماه"],
  ["heading", "تراکنش‌های اخیر"],
  [
    "body-md",
    "هر ماه شمسی بودجه از نو شروع می‌شود و مانده‌اش به ماه بعد نمی‌رود.",
  ],
  ["body", "تراکنش‌هایی که شرحشان «؟» است هنوز شناسایی نشده‌اند."],
  ["label", "مبلغ"],
  ["control", "ثبت هزینه"],
  ["caption", "۹ مهر ۱۴۰۵، کارت ملی"],
  ["eyebrow", "خوراک"],
  ["amount-hero", "۱۲۸٬۴۵۰٬۰۰۰"],
  ["amount-lg", "−۸۵۰٬۰۰۰"],
  ["amount", "+۴۵٬۰۰۰٬۰۰۰"],
];

const SIZES = [
  "xs",
  "sm",
  "base",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "5xl",
];
const WEIGHTS = ["regular", "medium", "semibold", "bold", "heavy"];
const SPACES = [
  "0-5",
  "1",
  "1-5",
  "2",
  "2-5",
  "3",
  "4",
  "5",
  "6",
  "8",
  "10",
  "12",
  "16",
  "20",
];
const RADII = ["xs", "sm", "md", "lg", "xl", "2xl", "pill"];
const SHADOWS = ["xs", "sm", "md", "lg", "xl", "sheet", "focus"];
const DURATIONS = ["instant", "fast", "base", "slow", "slower"];
const EASINGS = ["out", "in", "in-out", "lift"];
const ICON_SIZES = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"];

/** The resolved value of a custom property, re-read when the theme changes. */
function useTokenValue(token: string) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState("");

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const read = () =>
      setValue(getComputedStyle(element).getPropertyValue(token).trim());
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, [token]);

  return { ref, value };
}

function Swatch({ token, use }: { token: string; use?: string }) {
  const { ref, value } = useTokenValue(token);
  return (
    <span ref={ref} className={styles.swatch}>
      <span
        className={styles.swatchColor}
        style={{ background: `var(${token})` }}
      />
      <span className={styles.swatchText}>
        <code className={styles.code}>{token.replace(/^--/, "")}</code>
        {use ? <span className={styles.use}>{use}</span> : null}
        <code className={styles.value}>{value}</code>
      </span>
    </span>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {note ? <p className={styles.note}>{note}</p> : null}
      {children}
    </section>
  );
}

export function Palette() {
  return (
    <Section
      title="Palette"
      note="Raw ramps. Components never use these; they use the semantic aliases. royal-600 #223BB2 is the brand."
    >
      <div className={styles.ramps}>
        {RAMPS.map(([name, steps]) => (
          <div key={name} className={styles.ramp}>
            <span className={styles.rampName}>{name}</span>
            <div className={styles.rampSteps}>
              {steps.map((step) => (
                <RampStep key={step} token={`--${name}-${step}`} step={step} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function RampStep({ token, step }: { token: string; step: string }) {
  const { ref, value } = useTokenValue(token);
  return (
    <span ref={ref} className={styles.rampStep} title={`${token} ${value}`}>
      <span
        className={styles.rampColor}
        style={{ background: `var(${token})` }}
      />
      <span className={styles.rampLabel}>{step}</span>
    </span>
  );
}

export function SemanticColors() {
  return (
    <>
      {SEMANTIC.map(([group, tokens]) => (
        <Section key={group} title={group}>
          <div className={styles.swatches}>
            {tokens.map(([token, use]) => (
              <Swatch key={token} token={token} use={use} />
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}

export function CategoryColors() {
  const t = useTranslations("categoryColor");
  return (
    <Section
      title="Categories"
      note="10 hues and slate. Dot = --cat-<hue>, fill = -soft, label = -text. Always shown with the category name."
    >
      <div className={styles.categories}>
        {CATEGORY_COLORS.map((color) => (
          <div key={color} className={styles.category}>
            <span
              className={styles.categoryDot}
              style={{ background: `var(--cat-${color})` }}
            />
            <span
              className={styles.categoryPill}
              style={{
                background: `var(--cat-${color}-soft)`,
                color: `var(--cat-${color}-text)`,
              }}
            >
              {t(color)}
            </span>
            <code className={styles.code}>{color}</code>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function TypeScale() {
  return (
    <>
      <Section
        title="Type roles"
        note="Dana for everything. Every role sets its weight (Dana's default is hairline). Use as font: var(--type-…)."
      >
        <div className={styles.typeRoles}>
          {TYPE_ROLES.map(([role, sample]) => (
            <div key={role} className={styles.typeRow}>
              <code className={styles.code}>type-{role}</code>
              <span
                style={{
                  font: `var(--type-${role})`,
                  fontFeatureSettings: role.startsWith("amount")
                    ? "var(--font-features-tabular)"
                    : undefined,
                }}
              >
                {sample}
              </span>
            </div>
          ))}
        </div>
      </Section>
      <Section
        title="Sizes"
        note="12px floor: Persian dots blur below it. UI base 14, reading 16."
      >
        <div className={styles.typeRoles}>
          {SIZES.map((size) => (
            <TypeSize key={size} size={size} />
          ))}
        </div>
      </Section>
      <Section title="Weights">
        <div className={styles.weights}>
          {WEIGHTS.map((weight) => (
            <span key={weight} className={styles.weight}>
              <span
                style={{
                  fontWeight: `var(--weight-${weight})`,
                  fontSize: "var(--text-2xl)",
                }}
              >
                حساب
              </span>
              <code className={styles.code}>{weight}</code>
            </span>
          ))}
        </div>
      </Section>
    </>
  );
}

function TypeSize({ size }: { size: string }) {
  const { ref, value } = useTokenValue(`--text-${size}`);
  return (
    <div className={styles.typeRow}>
      <code ref={ref} className={styles.code}>
        text-{size} <span className={styles.value}>{value}</span>
      </code>
      <span
        style={{
          fontSize: `var(--text-${size})`,
          fontWeight: "var(--weight-medium)",
        }}
      >
        موجودی حساب‌ها
      </span>
    </div>
  );
}

export function Numerals() {
  const sample = ["۱۱۱٬۱۱۱", "۸۵۰٬۰۰۰", "۴۵٬۰۰۰٬۰۰۰", "۹٬۹۹۹"];
  return (
    <Section
      title="Numerals"
      note="Persian digits come from Intl.NumberFormat('fa-IR'), never from a font feature. Amounts use ss03 for equal-width digits so columns line up. Never ss02."
    >
      <div className={styles.numerals}>
        <div>
          <span className={styles.use}>Proportional (default)</span>
          <div className={styles.numberColumn}>
            {sample.map((value) => (
              <span key={value}>{value}</span>
            ))}
          </div>
        </div>
        <div>
          <span className={styles.use}>Tabular (ss03)</span>
          <div
            className={styles.numberColumn}
            style={{ fontFeatureSettings: "var(--font-features-tabular)" }}
          >
            {sample.map((value) => (
              <span key={value}>{value}</span>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

export function SpacingRadiusShadow() {
  return (
    <>
      <Section title="Spacing" note="4px grid with 2px half-steps.">
        <div className={styles.spaces}>
          {SPACES.map((space) => (
            <div key={space} className={styles.spaceRow}>
              <code className={styles.code}>space-{space}</code>
              <span
                className={styles.spaceBar}
                style={{ inlineSize: `var(--space-${space})` }}
              />
            </div>
          ))}
        </div>
      </Section>
      <Section
        title="Radius"
        note="8 controls, 12 cards and popovers, 16 dialogs, 24 sheets, pill for badges."
      >
        <div className={styles.tiles}>
          {RADII.map((radius) => (
            <span
              key={radius}
              className={styles.tile}
              style={{ borderRadius: `var(--radius-${radius})` }}
            >
              <code className={styles.code}>{radius}</code>
            </span>
          ))}
        </div>
      </Section>
      <Section
        title="Shadows"
        note="Royal-tinted in light, black in dark. Focus is a 3px ring."
      >
        <div className={styles.tiles}>
          {SHADOWS.map((shadow) => (
            <span
              key={shadow}
              className={styles.tile}
              style={{ boxShadow: `var(--shadow-${shadow})` }}
            >
              <code className={styles.code}>{shadow}</code>
            </span>
          ))}
        </div>
      </Section>
    </>
  );
}

export function MotionAndIcons() {
  const [run, setRun] = useState(0);
  return (
    <>
      <Section
        title="Motion"
        note="ease-out for nearly everything; ease-lift (one gentle overshoot) for things that pop. Off under reduced motion. Click to replay."
      >
        <button
          type="button"
          className={styles.replay}
          onClick={() => setRun(run + 1)}
        >
          {DURATIONS.map((duration) => (
            <span key={`${duration}-${run}`} className={styles.motionRow}>
              <code className={styles.code}>{duration}</code>
              <span className={styles.motionTrack}>
                <span
                  className={styles.motionDot}
                  style={{ animationDuration: `var(--duration-${duration})` }}
                />
              </span>
            </span>
          ))}
          {EASINGS.map((easing) => (
            <span key={`${easing}-${run}`} className={styles.motionRow}>
              <code className={styles.code}>ease-{easing}</code>
              <span className={styles.motionTrack}>
                <span
                  className={styles.motionDot}
                  style={{
                    animationTimingFunction: `var(--ease-${easing})`,
                    animationDuration: "var(--duration-slower)",
                  }}
                />
              </span>
            </span>
          ))}
        </button>
      </Section>
      <Section
        title="Icon sizes"
        note="lucide-react, 2px stroke. Import the *Icon export."
      >
        <div className={styles.icons}>
          {ICON_SIZES.map((size, index) => {
            const Icon = [
              WalletIcon,
              ReceiptIcon,
              PiggyBankIcon,
              CalendarIcon,
              ArrowLeftRightIcon,
              WalletIcon,
              ReceiptIcon,
            ][index];
            return (
              <span key={size} className={styles.iconCell}>
                <Icon
                  style={{
                    width: `var(--icon-size-${size})`,
                    height: `var(--icon-size-${size})`,
                  }}
                  aria-hidden="true"
                />
                <code className={styles.code}>{size}</code>
              </span>
            );
          })}
        </div>
      </Section>
    </>
  );
}
