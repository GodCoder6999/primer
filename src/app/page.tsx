import Link from "next/link";
import { CarouselRow } from "@/components/CarouselRow";
import { HeroBillboard } from "@/components/HeroBillboard";
import { SiteFooter } from "@/components/SiteFooter";
import { TopNav } from "@/components/TopNav";
import { heroSlides, rows } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col bg-[var(--pv-base)]">
      <TopNav activeHref="/" />

      <main className="flex-1">
        {/* Hero sits at y=0, beneath the transparent nav. */}
        <HeroBillboard slides={heroSlides} />

        {rows.map((row) => (
          <CarouselRow key={row.id} row={row} />
        ))}

        <div className="flex justify-center pb-16 pt-4">
          <Link
            href="/browse"
            className="rounded-lg bg-[#252e39] px-6 py-3 text-base font-medium text-white transition-colors duration-100 hover:bg-[#33373d]"
          >
            See more
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
