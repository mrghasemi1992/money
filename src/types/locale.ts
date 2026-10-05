import type { LOCALES } from "@/constants/locale";

export type Locale = (typeof LOCALES)[number];

export type Direction = "rtl" | "ltr";
