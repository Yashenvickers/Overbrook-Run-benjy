import { Container } from "@/components/ui/Container";

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <Container className="py-10">
      <header className="mb-8 border-b-2 border-paper pb-6">
        <h1 className="headline text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-paper-dim">Last updated: {updated}</p>
      </header>
      <div className="prose-dark max-w-prose">{children}</div>
    </Container>
  );
}
