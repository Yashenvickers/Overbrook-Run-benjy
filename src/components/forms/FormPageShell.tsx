import { Container } from "@/components/ui/Container";

export function FormPageShell({
  kicker,
  title,
  intro,
  children,
  aside,
}: {
  kicker: string;
  title: string;
  intro: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <Container className="py-10">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <header className="mb-8 border-b-2 border-paper pb-6">
            <p className="kicker mb-2">{kicker}</p>
            <h1 className="headline text-4xl sm:text-5xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-paper-dim">{intro}</p>
          </header>
          {children}
        </div>
        {aside ? <aside className="lg:pt-6">{aside}</aside> : null}
      </div>
    </Container>
  );
}
