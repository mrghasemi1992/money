import { notFound } from "next/navigation";

import { APP_ICONS } from "@/constants/app-icon";
import { appIconResponse } from "@/helpers/app-icon";

/** Rendered at build time; any other file name is not found. */
export const dynamicParams = false;

export function generateStaticParams() {
  return APP_ICONS.map(({ file }) => ({ file }));
}

/**
 * The web app manifest's icons (src/app/manifest.webmanifest). Public, like icon.svg: the
 * browser fetches them without the session, and src/proxy.ts lets .png paths through.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/app-icons/[file]">,
) {
  const { file } = await params;
  const icon = APP_ICONS.find((entry) => entry.file === file);
  if (!icon) notFound();
  return appIconResponse(
    icon.size,
    icon.purpose === "maskable" ? "full" : "rounded",
  );
}
