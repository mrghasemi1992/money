import type { Metadata } from "next";

import { fontVariables } from "@/styles/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "پول",
  description: "حسابداری شخصی",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
