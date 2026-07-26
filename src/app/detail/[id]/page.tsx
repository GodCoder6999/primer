import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarouselRow } from "@/components/CarouselRow";
import { DetailTabs, EpisodeGrid, InfoPanel } from "@/components/DetailTabs";
import { VideoPlayer } from "@/components/VideoPlayer";
import { SiteFooter } from "@/components/SiteFooter";
import { TopNav } from "@/components/TopNav";
import {
  AudioDescriptionIcon,
  DownloadIcon,
  PlayIcon,
  PlusIcon,
  PrimeSwooshIcon,
  ShareIcon,
  ThumbDownIcon,
  ThumbUpIcon,
  TrailerIcon,
} from "@/components/icons";
import { allTitles, findTitle, getTitleDetail, heroSlides, rows } from "@/lib/mock-data";

export function generateStaticParams() {
  return [...allTitles, ...heroSlides.map((h) => h.title)].map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const title = findTitle(id);
  return {
    title: title
      ? `Prime Video: ${title.name}${title.seasonLabel ? ` - ${title.seasonLabel}` : ""}`
      : "Prime Video",
  };
}

/**
 * Title detail page, structured from the target's series detail layout.
 *
 * Above the fold is an 834px region: full-bleed backdrop with the title
 * treatment and actions over it, then a three-column band (actions /
 * synopsis / cast). Below: tab strip, episode grid, a related carousel, and
 * a two-column stack of bordered info panels (777.6px + 518.4px, 20px gap).
 */
export default async function DetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ autoplay?: string; season?: string; episode?: string }>;
}) {
  const { id } = await params;
  const { autoplay, season, episode } = await searchParams;
  const title = findTitle(id);
  if (!title) notFound();

  // Playback is a query param on the detail route, matching the target's
  // `/detail/<id>?autoplay=1&t=0` contract rather than a separate route.
  if (autoplay === "1") return <VideoPlayer title={title} season={season} episode={episode} />;

  // Real credits + episodes for this specific title (movies have none).
  const detail = getTitleDetail(id);
  const relatedRow = {
    ...rows[1],
    id: "also-watched",
    heading: "Customers also watched",
    seeMoreHref: undefined,
  };

  return (
    <div className="flex min-h-full flex-col bg-[var(--pv-base)]">
      <TopNav />

      <main className="flex-1">
        {/* ---------------------------------------------- above the fold
            Measured on the target at 1440: a 762px hero holding the backdrop,
            two gradient scrims, the title pinned top-left, and a three-column
            band bottom-aligned against the hero floor (all columns bottom out
            at y≈765). Columns sit at x=72 / 448 / 1128. */}
        <section className="relative h-[762px] overflow-hidden">
          {/* Backdrop — the target renders it 801px tall against a 762px hero,
              so it bleeds 39px past the bottom edge. */}
          <Image
            src={title.heroImage ?? title.cardImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(rgba(0,5,13,0.8), rgba(0,5,13,0) 22.78%)" }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(0deg, rgb(0,5,13), rgba(0,5,13,0) 33.42%)" }}
          />

          {/* Title — top-left, 50px/67.2px bold. */}
          <div className="relative px-4 pt-[96px] md:px-[72px]">
            <PrimeSwooshIcon className="mb-3 h-[22px] w-[56px] text-[var(--pv-blue)]" />
            <h1 className="text-[50px] font-bold leading-[67.2px] text-white">{title.name}</h1>
          </div>

          {/* Bottom-aligned band. */}
          <div className="absolute inset-x-0 bottom-0 px-4 pb-[38px] md:px-[72px]">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-0">
              {/* --- left column: actions, 348px wide --- */}
              <div className="w-full lg:w-[348px] lg:shrink-0">
                <div className="mb-4 flex items-center gap-3">
                  {[
                    { label: "Watch trailer", icon: <TrailerIcon className="size-6" /> },
                    { label: "Add to Watchlist", icon: <PlusIcon className="size-6" /> },
                    { label: "Like", icon: <ThumbUpIcon className="size-6" /> },
                    { label: "Not for me", icon: <ThumbDownIcon className="size-6" /> },
                    { label: "Share", icon: <ShareIcon className="size-6" /> },
                    { label: "Download", icon: <DownloadIcon className="size-6" /> },
                  ].map((b) => (
                    <button
                      key={b.label}
                      type="button"
                      aria-label={b.label}
                      className="grid size-12 shrink-0 place-items-center rounded-full bg-[rgb(0_5_13_/_0.4)] text-white transition-colors duration-100 hover:bg-[rgb(0_5_13_/_0.65)]"
                    >
                      {b.icon}
                    </button>
                  ))}
                </div>

                <Link
                  href={`/detail/${title.id}?autoplay=1&t=0`}
                  className="flex h-[62px] w-full items-center justify-center gap-3 rounded-lg bg-white text-[20px] font-medium leading-[23px] text-[#00050d] transition-colors duration-100 hover:bg-white/90 lg:w-[348px]"
                >
                  <PlayIcon className="size-6" />
                  Watch now
                </Link>

                <button
                  type="button"
                  className="mt-[14px] flex h-[62px] w-full items-center justify-between rounded-lg bg-white/20 px-5 text-[20px] font-medium leading-[23px] text-white transition-colors duration-100 hover:bg-white/30 lg:w-[348px]"
                >
                  <PrimeSwooshIcon className="h-[22px] w-[56px] text-white" />
                  <span>Subscribe</span>
                </button>

                <p className="mt-3 text-[14px] leading-[20px] text-white">First episode free</p>
                <p className="text-[14px] leading-[20px] text-white">Terms apply</p>
              </div>

              {/* --- center column: badges, synopsis, meta --- */}
              <div className="w-full lg:ml-[28px] lg:max-w-[652px] lg:flex-1">
                <div className="mb-[12px] flex items-center gap-[56px]">
                  {title.badge && (
                    <span className="rounded-[3px] bg-white px-[7px] py-[3px] text-[13px] font-bold leading-[13px] text-[#00050d]">
                      {title.badge}
                    </span>
                  )}
                  <span className="flex items-center gap-2 text-[16px] font-bold leading-4 text-[rgb(55,241,163)]">
                    <AudioDescriptionIcon className="size-5" />
                    All episodes available
                  </span>
                </div>

                <p className="line-clamp-3 text-[18px] font-medium leading-[25px] text-white">
                  {title.synopsis}
                </p>

                <div className="mt-[16px] flex flex-wrap items-center gap-x-[14px] gap-y-2 text-[16px] font-bold leading-4">
                  {title.genres?.map((g) => (
                    <span key={g} className="flex items-center gap-x-[14px]">
                      <Link href="/browse" className="text-white hover:underline">
                        {g}
                      </Link>
                      <span aria-hidden="true" className="text-[rgb(153,153,153)]">
                        •
                      </span>
                    </span>
                  ))}
                  {detail.rank && <span className="text-[rgb(153,153,153)]">{detail.rank}</span>}
                  {title.year && <span className="text-[rgb(153,153,153)]">{title.year}</span>}
                  <span className="text-[rgb(153,153,153)]">1 season</span>
                </div>
              </div>

              {/* --- right column: cast + badges, 225px --- */}
              <div className="w-full lg:ml-[28px] lg:w-[225px] lg:shrink-0">
                <p className="text-[16px] font-bold leading-4">
                  <span className="text-[rgb(153,153,153)]">Cast: </span>
                  {detail.cast.slice(0, 3).map((c, i) => (
                    <span key={c}>
                      <span className="text-white underline underline-offset-2">{c}</span>
                      {i < 2 ? <span className="text-[rgb(153,153,153)]">, </span> : null}
                    </span>
                  ))}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  {[title.maturityRating ?? "U/A 13+", "CC", "AD"].map((b) => (
                    <span
                      key={b}
                      className="rounded-[3px] bg-[rgb(51,55,61)] px-[6px] py-[3px] text-[13px] font-bold leading-[13px] text-white"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <h2 className="px-4 pt-6 text-xl font-bold leading-7 text-white md:px-[72px]">
          {detail.seasonLabel}
        </h2>

        {/* Tab strip. Scroll-to-section + scroll-spy on the target, so every
            section below stays mounted and the tabs act as anchors. */}
        <DetailTabs hasEpisodes={detail.episodes.length > 0} />

        {/* ------------------------------------------------ § episodes */}
        {detail.episodes.length > 0 && (
          <section id="episodes" className="scroll-mt-20">
            <EpisodeGrid episodes={detail.episodes} titleId={title.id} />
          </section>
        )}

        {/* ------------------------------------------------- § related */}
        <section id="related" className="mt-8 scroll-mt-20">
          <CarouselRow row={relatedRow} />
        </section>

        {/* ------------------------------------------------- § details */}
        <div
          id="details"
          className="mt-10 grid scroll-mt-20 gap-5 px-4 md:px-[72px] lg:grid-cols-[777.6fr_518.4fr]"
        >
          <div className="flex flex-col gap-5">
            <InfoPanel title={title.name}>
              <div className="mb-2 flex flex-wrap items-center gap-2 text-base">
                {title.genres?.map((g) => (
                  <span key={g} className="underline underline-offset-2">
                    {g}
                  </span>
                ))}
                <span>{title.year}</span>
                {detail.qualityBadges.map((b) => (
                  <span
                    key={b}
                    className="rounded-[3px] border border-white/40 px-[5px] py-[1px] text-[11px]"
                  >
                    {b}
                  </span>
                ))}
              </div>
              <p className="line-clamp-3">{title.synopsis}</p>
              <button type="button" className="mt-1 text-white underline underline-offset-2">
                More
              </button>
            </InfoPanel>

            <InfoPanel title="Creators and Cast">
              <dl className="space-y-2">
                {[
                  ["Directors", detail.directors],
                  ["Producers", detail.producers],
                  ["Cast", detail.cast],
                ].map(([label, people]) => (
                  <div key={label as string} className="grid grid-cols-[110px_minmax(0,1fr)] gap-2">
                    <dt className="text-white">{label as string}</dt>
                    <dd>
                      {(people as string[]).map((p, i) => (
                        <span key={p}>
                          <span className="underline underline-offset-2">{p}</span>
                          {i < (people as string[]).length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
                <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2">
                  <dt className="text-white">Studio</dt>
                  <dd>{detail.studio}</dd>
                </div>
              </dl>
            </InfoPanel>
          </div>

          <div className="flex flex-col gap-5">
            <InfoPanel title="Content advisory">
              <span className="mr-2 rounded-[3px] border border-white/40 px-[5px] py-[1px] text-[11px]">
                A
              </span>
              {detail.contentAdvisory.join(", ")}
            </InfoPanel>
            <InfoPanel title="Audio languages">{detail.audioLanguages.join(", ")}</InfoPanel>
            <InfoPanel title="Subtitles">{detail.subtitles.join(", ")}</InfoPanel>
          </div>
        </div>

        <p className="mt-6 px-4 text-base text-[var(--pv-text-secondary)] md:px-[72px]">
          By clicking play, you agree to our{" "}
          <Link href="/terms" className="text-[var(--pv-link)] underline underline-offset-2">
            Terms of Use
          </Link>
          .
        </p>

        <hr className="mx-4 my-8 border-white/15 md:mx-[72px]" />

        <section className="px-4 md:px-[72px]">
          <h3 className="mb-4 text-xl font-bold leading-6 tracking-[0.4px] text-white">Feedback</h3>
          <button
            type="button"
            className="rounded-lg bg-[#252e39] px-4 py-3 text-base font-medium text-white transition-colors duration-100 hover:bg-[#33373d]"
          >
            Send us feedback
          </button>
        </section>

        <section className="mt-10 px-4 pb-16 md:px-[72px]">
          <h3 className="mb-4 text-xl font-bold leading-6 tracking-[0.4px] text-white">Support</h3>
          <Link href="/help" className="text-[var(--pv-link)] underline underline-offset-2">
            Get Help
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
