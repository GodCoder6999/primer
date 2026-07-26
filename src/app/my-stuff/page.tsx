"use client";

import { useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { TitleGrid } from "@/components/TitleGrid";
import { TopNav } from "@/components/TopNav";
import { cn } from "@/lib/utils";
import { allTitles } from "@/lib/mock-data";

const TABS = ["Watchlist", "Purchases & Rentals", "Downloads"] as const;
type Tab = (typeof TABS)[number];

/**
 * "My Stuff" — a signed-in surface reconstructed from mock data.
 * Interaction model: click-to-switch tabs (the target is not scroll-driven here).
 */
export default function MyStuffPage() {
  const [tab, setTab] = useState<Tab>("Watchlist");

  const buckets: Record<Tab, typeof allTitles> = {
    Watchlist: allTitles.slice(0, 12),
    "Purchases & Rentals": allTitles.slice(12, 20),
    Downloads: [],
  };
  const titles = buckets[tab];

  return (
    <div className="flex min-h-full flex-col bg-[var(--pv-base)]">
      <TopNav activeHref="/my-stuff" />

      <main className="flex-1 pt-[calc(66px+32px)]">
        <h1 className="mb-6 px-4 text-[32px] font-bold leading-10 md:px-[72px]">My Stuff</h1>

        <div
          role="tablist"
          aria-label="My Stuff sections"
          className="mb-8 flex gap-2 border-b border-white/15 px-4 md:px-[72px]"
        >
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "relative h-12 px-[14px] text-base font-medium tracking-[0.64px] transition-colors duration-100 ease-in-out",
                tab === t ? "text-white" : "text-[var(--pv-text-secondary)] hover:text-white",
              )}
            >
              {t}
              {tab === t && (
                <span className="absolute inset-x-[14px] bottom-0 h-[3px] rounded-t bg-[var(--pv-blue)]" />
              )}
            </button>
          ))}
        </div>

        {titles.length > 0 ? (
          <TitleGrid titles={titles} />
        ) : (
          <div className="px-4 py-20 text-center md:px-[72px]">
            <p className="mb-2 text-xl font-bold">Nothing here yet</p>
            <p className="text-base text-[var(--pv-text-secondary)]">
              Titles you download will appear here.
            </p>
          </div>
        )}

        <div className="h-16" />
      </main>

      <SiteFooter />
    </div>
  );
}
