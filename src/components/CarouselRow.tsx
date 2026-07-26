"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { CarouselRowData } from "@/types/catalog";
import { PortraitCard, TitleCard, Top10Card } from "./TitleCard";
import { ChevronLeftIcon, ChevronRightIcon, TrendingIcon } from "./icons";

const CARD_WIDTH = 270.4;
const CARD_GAP = 10;
/** Track padding that lets a card's hover panel overflow the row. */
const TRACK_PAD_TOP = 150;
/** Card heights by variant — arrows are centred on the art, not the padded box. */
const CARD_HEIGHT = 152.1;
const PORTRAIT_HEIGHT = CARD_WIDTH * 1.5;

/**
 * Horizontally-scrolling carousel row.
 *
 * Interaction model: arrow buttons + native horizontal scroll with x snap.
 * The track carries oversized vertical padding (150px top / 600px bottom) so a
 * card's hover panel can overflow without being clipped by the parent's
 * `overflow-x: hidden` — this mirrors the target exactly.
 */
export function CarouselRow({ row }: { row: CarouselRowData }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [perPage, setPerPage] = useState(5);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
    setPerPage(Math.max(1, Math.round(el.clientWidth / (CARD_WIDTH + CARD_GAP))));
  }, []);

  useEffect(() => {
    sync();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const page = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * perPage * (CARD_WIDTH + CARD_GAP), behavior: "smooth" });
  };

  const isTop10 = row.variant === "top10";
  const isPortrait = row.variant === "portrait";

  return (
    <section className="mb-[42px]">
      {/* Row header */}
      <div className="mr-[72px] flex items-center">
        <span className="ml-4 flex items-center pb-[11px] md:ml-[72px]">
          <h2 className="mr-9 flex items-center text-xl font-bold leading-7 text-white">
            {row.heading}
          </h2>
          {isTop10 && <TrendingIcon className="size-[22px] text-white" />}
          {row.seeMoreHref && (
            <Link
              href={row.seeMoreHref}
              className="flex items-center gap-1 text-base font-medium text-white transition-colors duration-200 hover:text-[var(--pv-link)]"
            >
              See more
              <ChevronRightIcon className="size-4" />
            </Link>
          )}
        </span>
      </div>

      {/* Track + arrows.
          `overflow-x: clip` (not `hidden`) so the vertical axis can stay
          `visible` — `hidden` on one axis forces the other to `auto`, which
          would clip the hover panel as it expands past the row. */}
      <div className="relative" style={{ overflowX: "clip", overflowY: "visible" }}>
        <RowArrow
          side="left"
          hidden={atStart}
          height={isPortrait ? PORTRAIT_HEIGHT : CARD_HEIGHT}
          label={`previous ${perPage} titles`}
          onClick={() => page(-1)}
        />

        <ul
          ref={trackRef}
          className="pv-scrollbar-none flex snap-x items-start overflow-x-scroll px-4 md:px-[72px]"
          style={{
            paddingTop: 150,
            paddingBottom: 600,
            marginTop: -150,
            marginBottom: -600,
            // Without this, a snap-start target aligns to the padding edge and
            // the browser parks scrollLeft at the gutter width (72), hiding the
            // left gutter and permanently arming the "previous" arrow.
            scrollPaddingLeft: "var(--pv-gutter)",
          }}
        >
          {row.titles.map((title, i) => (
            <li
              key={title.id}
              className={cn("shrink-0 snap-start", i < row.titles.length - 1 && "mr-[10px]")}
            >
              {isTop10 ? (
                <Top10Card title={title} rank={i + 1} />
              ) : isPortrait ? (
                <PortraitCard title={title} />
              ) : (
                <TitleCard title={title} />
              )}
            </li>
          ))}
        </ul>

        <RowArrow
          side="right"
          hidden={atEnd}
          height={isPortrait ? PORTRAIT_HEIGHT : CARD_HEIGHT}
          label={`next ${perPage} titles`}
          onClick={() => page(1)}
        />
      </div>
    </section>
  );
}

function RowArrow({
  side,
  hidden,
  height,
  label,
  onClick,
}: {
  side: "left" | "right";
  hidden: boolean;
  height: number;
  label: string;
  onClick: () => void;
}) {
  if (hidden) return null;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{ top: TRACK_PAD_TOP, height }}
      className={cn(
        "absolute z-20 hidden w-[62px] items-center justify-center",
        "bg-[rgb(0_5_13_/_0.5)] text-white transition-colors duration-300 ease-in-out",
        "hover:bg-[rgb(0_5_13_/_0.7)] md:flex",
        side === "left" ? "left-0 rounded-r-lg" : "right-0 rounded-l-lg",
      )}
    >
      {side === "left" ? (
        <ChevronLeftIcon className="size-6" />
      ) : (
        <ChevronRightIcon className="size-6" />
      )}
    </button>
  );
}
