import type { Metadata } from "next";
import { getArticles } from "@/lib/content";
import { CategoryPageShell } from "@/components/layout/CategoryPageShell";

export const metadata: Metadata = {
  title: "Latest",
  description: "Every new story on Preee TV, newest first.",
  alternates: { canonical: "/latest" },
};

export default async function LatestPage() {
  const articles = await getArticles();
  return (
    <CategoryPageShell
      title="The Latest"
      description="Everything, newest first — music, culture, business, interviews, and performances."
      articles={articles}
      path="/latest"
    />
  );
}
