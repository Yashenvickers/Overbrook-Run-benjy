import type { Metadata } from "next";
import { getArticlesByCategory, getCategory } from "@/lib/content";
import { CategoryPageShell } from "@/components/layout/CategoryPageShell";

export const metadata: Metadata = {
  title: "The Business",
  description: "The Business coverage from Preee TV.",
  alternates: { canonical: "/business" },
};

export default async function Page() {
  const [articles, category] = await Promise.all([
    getArticlesByCategory("business"),
    getCategory("business"),
  ]);
  return (
    <CategoryPageShell
      title={category?.title ?? "The Business"}
      description={category?.description ?? ""}
      articles={articles}
      path="/business"
    />
  );
}
