import { CarouselRow } from "@/components/CarouselRow";
import { HeroBillboard } from "@/components/HeroBillboard";
import { SiteFooter } from "@/components/SiteFooter";
import { TopNav } from "@/components/TopNav";
import type { CarouselRowData, HeroSlide } from "@/types/catalog";

/**
 * Shared shell for the storefront surfaces (Movies, TV shows, Free to me,
 * Subscriptions). They are structurally identical to the home page: an
 * optional hero billboard followed by carousel rows.
 *
 * `heading` renders the page's <h1>. The target omits it on Free to me and
 * Subscriptions, where the hero carries the page identity instead.
 */
export function StorefrontPage({
  activeHref,
  heading,
  slides,
  rows,
}: {
  activeHref: string;
  heading?: string;
  slides?: HeroSlide[];
  rows: CarouselRowData[];
}) {
  return (
    <div className="flex min-h-full flex-col bg-[var(--pv-base)]">
      <TopNav activeHref={activeHref} />

      <main className="flex-1">
        {slides?.length ? (
          <HeroBillboard slides={slides} />
        ) : (
          <div className="h-[66px]" />
        )}

        {heading && (
          <h1 className="mb-6 px-4 text-[32px] font-bold leading-10 md:px-[72px]">{heading}</h1>
        )}

        {rows.map((row) => (
          <CarouselRow key={row.id} row={row} />
        ))}

        <div className="h-10" />
      </main>

      <SiteFooter />
    </div>
  );
}
