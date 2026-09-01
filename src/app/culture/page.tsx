import type { Metadata } from "next";
import { getArticlesByCategory, getCategory } from "@/lib/content";
import { CategoryPageShell } from "@/components/layout/CategoryPageShell";

export const metadata: Metadata = {
  title: "Culture",
  description: "Culture coverage from Preee TV.",
  alternates: { canonical: "/culture" },
};

export default async function Page() {
  const [articles, category] = await Promise.all([
    getArticlesByCategory("culture"),
    getCategory("culture"),
  ]);
  return (
    <CategoryPageShell
      title={category?.title ?? "Culture"}
      description={category?.description ?? ""}
      articles={articles}
      path="/culture"
    />
  );
}
