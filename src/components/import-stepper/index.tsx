"use client";

import { CheckIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { IMPORT_STEPS } from "@/constants/csv";
import type { ImportStep } from "@/types/csv";
import { cx } from "@/utils/cx";
import { formatNumber } from "@/utils/number";

import styles from "./styles.module.css";

type ImportStepperProps = {
  step: ImportStep;
  className?: string;
};

/**
 * Where the import is: from 768px up the five steps in a row (done ones ticked, the current
 * one bold), on phones the current step's name, «مرحله ۲ از ۵» and five bars.
 */
export function ImportStepper({ step, className }: ImportStepperProps) {
  const t = useTranslations("importExport.import");
  const locale = useLocale();
  const current = IMPORT_STEPS.indexOf(step);
  const state = (index: number) =>
    index < current ? "done" : index === current ? "current" : "next";

  return (
    <div className={cx(styles.root, className)}>
      <ol className={styles.steps}>
        {IMPORT_STEPS.map((key, index) => (
          <li
            key={key}
            className={styles.step}
            data-state={state(index)}
            aria-current={index === current ? "step" : undefined}
          >
            {index > 0 ? (
              <span className={styles.line} aria-hidden="true" />
            ) : null}
            <span className={styles.number} aria-hidden="true">
              {index < current ? (
                <CheckIcon className={styles.check} />
              ) : (
                formatNumber(index + 1, locale)
              )}
            </span>
            <span className={styles.label}>{t(`steps.${key}`)}</span>
          </li>
        ))}
      </ol>

      <div className={styles.compact} aria-hidden="true">
        <div className={styles.compactHead}>
          <span className={styles.compactLabel}>{t(`steps.${step}`)}</span>
          <span className={styles.compactCount}>
            {t("stepOf", {
              step: formatNumber(current + 1, locale),
              total: formatNumber(IMPORT_STEPS.length, locale),
            })}
          </span>
        </div>
        <div className={styles.segments}>
          {IMPORT_STEPS.map((key, index) => (
            <span
              key={key}
              className={styles.segment}
              data-state={state(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
