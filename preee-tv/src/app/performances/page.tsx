import type { Metadata } from "next";
import { getArticlesByCategory, getCategory } from "@/lib/content";
import { CategoryPageShell } from "@/components/layout/CategoryPageShell";

export const metadata: Metadata = {
  title: "Performances",
  description: "Performances coverage from Preee TV.",
  alternates: { canonical: "/performances" },
};

export default async function Page() {
  const [articles, category] = await Promise.all([
    getArticlesByCategory("performances"),
    getCategory("performances"),
  ]);
  return (
    <CategoryPageShell
      title={category?.title ?? "Performances"}
      description={category?.description ?? ""}
      articles={articles}
      path="/performances"
    />
  );
}
