import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { requireUser } from "@/auth/session";
import { CategorySettings } from "@/components/category-settings";
import { listCategories } from "@/db/categories";
import { canWrite, toUserRole } from "@/helpers/role";

import {
  addStarterCategories,
  archiveCategory,
  createCategory,
  createSubcategory,
  deleteCategory,
  restoreCategory,
  updateCategory,
} from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("categories");
  return { title: t("title") };
}

export default async function CategoriesPage() {
  const { user } = await requireUser();
  const categories = await listCategories();

  return (
    <CategorySettings
      categories={categories}
      // Viewers get the page without write controls; every action checks again.
      canWrite={canWrite(toUserRole(user.role))}
      onCreate={createCategory}
      onCreateSubcategory={createSubcategory}
      onUpdate={updateCategory}
      onArchive={archiveCategory}
      onDelete={deleteCategory}
      onRestore={restoreCategory}
      onAddStarters={addStarterCategories}
    />
  );
}
