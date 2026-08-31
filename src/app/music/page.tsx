import type { Metadata } from "next";
import { getArticlesByCategory, getCategory } from "@/lib/content";
import { CategoryPageShell } from "@/components/layout/CategoryPageShell";

export const metadata: Metadata = {
  title: "Music",
  description: "Music coverage from Preee TV.",
  alternates: { canonical: "/music" },
};

export default async function Page() {
  const [articles, category] = await Promise.all([
    getArticlesByCategory("music"),
    getCategory("music"),
  ]);
  return (
    <CategoryPageShell
      title={category?.title ?? "Music"}
      description={category?.description ?? ""}
      articles={articles}
      path="/music"
    />
  );
}
