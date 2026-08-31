import type { Metadata } from "next";
import { getArticlesByCategory, getCategory } from "@/lib/content";
import { CategoryPageShell } from "@/components/layout/CategoryPageShell";

export const metadata: Metadata = {
  title: "Interviews",
  description: "Interviews coverage from Preee TV.",
  alternates: { canonical: "/interviews" },
};

export default async function Page() {
  const [articles, category] = await Promise.all([
    getArticlesByCategory("interviews"),
    getCategory("interviews"),
  ]);
  return (
    <CategoryPageShell
      title={category?.title ?? "Interviews"}
      description={category?.description ?? ""}
      articles={articles}
      path="/interviews"
    />
  );
}
