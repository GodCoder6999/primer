"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { EntitlementBagIcon } from "./icons";
import type { Episode } from "@/types/catalog";

export const DETAIL_SECTIONS = [
  { id: "episodes", label: "Episodes" },
  { id: "related", label: "Related" },
  { id: "details", label: "Details" },
] as const;

/**
 * Detail-page tab strip.
 *
 * INTERACTION MODEL: scroll-to-section + scroll-spy — NOT content swapping.
 * Verified on the target: clicking a tab scrolls the page to that section
 * (Episodes y=792, Related y=1942, Details y=3167) with the URL unchanged,
 * and every section stays mounted. The active tab also updates on its own as
 * you scroll manually, so an IntersectionObserver drives the state.
 *
 * The strip itself is `position: static` on the target — it does not stick.
 * Labels are 18px/500 with 1.08px tracking, `transition: color .3s`,
 * #fff active / #999 idle, and the active one carries a 3px white ::after
 * spanning the full tab width.
 */
export function DetailTabs({ hasEpisodes = true }: { hasEpisodes?: boolean }) {
  // Movies carry no episodes, so that section is dropped entirely rather than
  // rendering an empty grid. Memoised — a fresh array each render would make
  // the observer effect below tear down and re-subscribe continuously.
  const sections = useMemo(
    () => (hasEpisodes ? DETAIL_SECTIONS : DETAIL_SECTIONS.filter((s) => s.id !== "episodes")),
    [hasEpisodes],
  );
  const [active, setActive] = useState<string>(sections[0].id);
  /** Suppresses the observer while a click-scroll is animating. */
  const lockRef = useRef(false);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (lockRef.current) return;
        // Choose the entry nearest the top of the viewport that is on screen.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Bias the band toward the upper part of the viewport so the active tab
      // flips as a section's heading reaches the top, matching the target.
      { rootMargin: "-80px 0px -55% 0px", threshold: 0 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  const goTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActive(id);

    // Hold the observer off for the whole animation. A fixed timeout is not
    // enough — a long smooth scroll outlasts it and the observer then snaps
    // the highlight to whichever section it passes through. Release on
    // `scrollend` where supported, with a generous timeout as the fallback.
    lockRef.current = true;
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      lockRef.current = false;
      window.removeEventListener("scrollend", release);
      window.clearTimeout(timer);
    };
    const timer = window.setTimeout(release, 2000);
    window.addEventListener("scrollend", release, { once: true });

    // Offset for the 66px sticky nav.
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div
      role="tablist"
      aria-label="Title sections"
      className="flex h-[66px] items-center px-4 md:px-[72px]"
    >
      {sections.map((s) => (
        <button
          key={s.id}
          role="tab"
          type="button"
          aria-selected={active === s.id}
          aria-controls={s.id}
          onClick={() => goTo(s.id)}
          className={cn(
            "relative mr-7 flex h-full items-center text-[18px] font-medium leading-[25px] tracking-[1.08px]",
            "transition-colors duration-300",
            active === s.id ? "text-white" : "text-[#999999] hover:text-white",
          )}
        >
          {s.label}
          {active === s.id && (
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-[3px] rounded-t bg-white"
            />
          )}
        </button>
      ))}
    </div>
  );
}

/** Episode grid — 306px columns, 24px gutter, 4-up at desktop. */
export function EpisodeGrid({ episodes, titleId }: { episodes: Episode[]; titleId: string }) {
  return (
    <>
      <p className="mb-2 px-4 text-base text-[var(--pv-text-secondary)] md:px-[72px]">
        {episodes.length} episodes
      </p>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-6 px-4 sm:grid-cols-2 md:px-[72px] lg:grid-cols-4">
        {episodes.map((ep) => (
          <li key={ep.number}>
            <EpisodeCard episode={ep} titleId={titleId} />
          </li>
        ))}
      </ul>
    </>
  );
}

/** 306 x 316 card: 16:9 thumb, then title, 2-line synopsis, and a meta row. */
function EpisodeCard({ episode, titleId }: { episode: Episode; titleId: string }) {
  return (
    <Link href={`/detail/${titleId}?autoplay=1&t=0&season=1&episode=${episode.number}`} className="block group">
      <article className="rounded-lg transition-opacity hover:opacity-80">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-[var(--pv-card-placeholder)]">
        <Image
          src={episode.thumbnail}
          alt={episode.name}
          fill
          sizes="306px"
          className="object-cover"
        />
        <span className="absolute bottom-[6px] left-[6px]">
          <EntitlementBagIcon className="size-[15px] text-[var(--pv-yellow)]" />
        </span>
      </div>

      <h3 className="mt-3 text-xl font-bold leading-6 tracking-[0.4px] text-white">
        {episode.number}. {episode.name}
      </h3>

      <p className="mt-4 line-clamp-2 text-base leading-[22px] text-[var(--pv-text-secondary)]">
        {episode.synopsis}
      </p>

      <div className="mt-4 flex items-center gap-2 text-[18px] font-medium leading-[25px] text-white">
        <span className="rounded-[3px] border border-white/40 px-[5px] py-[1px] text-[11px]">A</span>
        <span className="text-[13px] text-[var(--pv-text-secondary)]">CC</span>
        <span className="text-base">{episode.runtime}</span>
        <span className="text-base text-[var(--pv-text-secondary)]">{episode.releaseDate}</span>
      </div>
    </article>
    </Link>
  );
}

/** Rounded info panel: rgba(23,25,28,.8), radius 12, padding 20, 0.8px border. */
export function InfoPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border-[0.8px] border-[#66696e] bg-[rgb(23_25_28_/_0.8)] p-5">
      <h3 className="mb-3 text-xl font-bold leading-6 tracking-[0.4px] text-white">{title}</h3>
      <div className="text-base leading-[22px] text-[var(--pv-text-muted)]">{children}</div>
    </section>
  );
}
