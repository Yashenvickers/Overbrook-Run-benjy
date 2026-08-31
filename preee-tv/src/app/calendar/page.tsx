import type { Metadata } from "next";
import { getEvents } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { CalendarView } from "@/components/calendar/CalendarView";
import { SITE_URL } from "@/config/site";

export const metadata: Metadata = {
  title: "Culture Calendar",
  description:
    "Releases, festivals, award shows, industry nights, and Preee TV drops — plan around the moments.",
  alternates: { canonical: "/calendar" },
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const [events, params] = await Promise.all([getEvents(), searchParams]);

  return (
    <Container className="py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: events.slice(0, 20).map((e, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Event",
              name: e.title,
              startDate: e.start,
              ...(e.end ? { endDate: e.end } : {}),
              eventAttendanceMode:
                e.city === "Online" || e.city === "Global"
                  ? "https://schema.org/OnlineEventAttendanceMode"
                  : "https://schema.org/OfflineEventAttendanceMode",
              ...(e.city && e.city !== "Online" && e.city !== "Global"
                ? {
                    location: {
                      "@type": "Place",
                      name: e.venue ?? e.city,
                      address: e.city,
                    },
                  }
                : {
                    location: {
                      "@type": "VirtualLocation",
                      url: `${SITE_URL}/calendar`,
                    },
                  }),
              ...(e.description ? { description: e.description } : {}),
            },
          })),
        }}
      />
      <header className="mb-8 border-b-2 border-paper pb-6">
        <p className="kicker mb-2">Plan around the moments</p>
        <h1 className="headline text-4xl sm:text-6xl">Culture Calendar</h1>
        <p className="mt-3 max-w-2xl text-paper-dim">
          Releases, festivals, award shows, industry nights, and Preee TV drops. Filter it, then add
          what matters straight to your own calendar.
        </p>
      </header>
      <CalendarView events={events} initialEventId={params.event} />
    </Container>
  );
}
