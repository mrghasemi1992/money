import { notFound } from "next/navigation";

import { STARTUP_IMAGES } from "@/constants/startup-image";
import { startupImageResponse } from "@/helpers/startup-image";

/** Rendered at build time; any other file name is not found. */
export const dynamicParams = false;

export function generateStaticParams() {
  return STARTUP_IMAGES.map(({ file }) => ({ file }));
}

/**
 * The iOS startup images (apple-touch-startup-image links in the root layout). Public, like the
 * icons: iOS fetches them without the session, and src/proxy.ts lets .png paths through.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/startup-images/[file]">,
) {
  const { file } = await params;
  const image = STARTUP_IMAGES.find((entry) => entry.file === file);
  if (!image) notFound();
  return startupImageResponse(image);
}
