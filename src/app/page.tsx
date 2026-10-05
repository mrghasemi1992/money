import { getTranslations } from "next-intl/server";

import { requireUser } from "@/auth/session";

export default async function HomePage() {
  const { user } = await requireUser();
  const t = await getTranslations();

  return (
    <main>
      <h1>{t("metadata.appName")}</h1>
      <p>{t("home.greeting", { name: user.name })}</p>
    </main>
  );
}
