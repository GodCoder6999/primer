import { CarouselRow } from "@/components/CarouselRow";
import { LiveScheduleGrid } from "@/components/LiveScheduleRow";
import { SiteFooter } from "@/components/SiteFooter";
import { TopNav } from "@/components/TopNav";
import { liveChannels, rows } from "@/lib/mock-data";

export const metadata = { title: "Prime Video: Watch live TV" };

/**
 * /livetv has no hero carousel. The target opens with one events carousel,
 * then a schedule (EPG) grid — one row per channel.
 */
export default function LiveTvPage() {
  const events = { ...rows[0], id: "live-events", heading: "FanCode: Live and upcoming events", variant: "standard" as const, seeMoreHref: undefined };

  return (
    <div className="flex min-h-full flex-col bg-[var(--pv-base)]">
      <TopNav activeHref="/livetv" />

      <main className="flex-1 pt-[calc(66px+32px)]">
        <h1 className="mb-6 px-4 text-[32px] font-bold leading-10 md:px-[72px]">Live TV</h1>

        <CarouselRow row={events} />

        <LiveScheduleGrid channels={liveChannels} />

        <div className="h-16" />
      </main>

      <SiteFooter />
    </div>
  );
}
