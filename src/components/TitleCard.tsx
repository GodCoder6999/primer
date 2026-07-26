"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Title } from "@/types/catalog";
import { EntitlementBagIcon, InfoIcon, PlayIcon, PlusIcon, PrimeSwooshIcon } from "./icons";

/** Card geometry, measured on the live site. */
const CARD_W = 270.4;
const CARD_H = 152.1;
/** Portrait (2:3) card, used by "Featured Originals" rows. */
const PORTRAIT_W = 270.4;
const PORTRAIT_H = PORTRAIT_W * 1.5; // 2:3 — matches the measured 251.2 x 376.8
/** The art wrapper scales to this on hover (421.8 / 270.4 === 237.3 / 152.1). */
const HOVER_SCALE = 1.56;

const SCALED_W = CARD_W * HOVER_SCALE; // 421.8
const SCALED_H = CARD_H * HOVER_SCALE; // 237.3
/** Half of the overflow, i.e. how far the scaled art bleeds past each edge. */
const BLEED_X = (SCALED_W - CARD_W) / 2; // 70.3
const BLEED_Y = (SCALED_H - CARD_H) / 2; // 42.6

/**
 * Standard 16:9 carousel card — 270.4 x 152.1.
 *
 * Interaction model: hover.
 *   rest  → art scale(1),    article overflow hidden
 *   hover → art scale(1.56), article overflow visible, z-index 2, and an
 *           information panel docked to the bottom edge of the *scaled* art.
 *
 * Scale-up runs `transform .3s cubic-bezier(0.2,0.45,0,1) .1s`; the return
 * to rest is deliberately faster: `transform .1s cubic-bezier(0.32,0,0.67,0)`.
 */
export function TitleCard({ title, rank }: { title: Title; rank?: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className={cn("relative", hovered ? "z-[2] overflow-visible" : "z-0 overflow-hidden")}
      style={{ width: CARD_W, height: CARD_H }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Art wrapper — this is the element that scales. */}
      <div
        className={cn(
          "absolute left-0 top-0 origin-center overflow-hidden bg-[var(--pv-card-placeholder)]",
          hovered ? "rounded-t-lg bg-black" : "rounded-lg",
        )}
        style={{
          width: CARD_W,
          height: CARD_H,
          transform: `scale(${hovered ? HOVER_SCALE : 1})`,
          transition: hovered
            ? "transform .3s cubic-bezier(0.2,0.45,0,1) .1s"
            : "transform .1s cubic-bezier(0.32,0,0.67,0)",
        }}
      >
        <Image
          src={title.cardImage}
          alt={title.name}
          fill
          sizes="422px"
          className="object-cover"
        />

        {/* Radial vignette burned into the target's card art. */}
        <div className="pv-card-vignette pointer-events-none absolute inset-0" />

        {title.badge && (
          <span
            aria-label={title.badge}
            className="absolute right-0 top-0 z-[2] rounded-bl-[3px] bg-white px-[7px] py-[3px] text-[13px] font-bold leading-[13px] text-[#00050d]"
            style={{ transition: "opacity .3s cubic-bezier(0.2,0.45,0,1) .1s" }}
          >
            {title.badge}
          </span>
        )}

        <span className="absolute bottom-[6px] left-[6px] z-[2]">
          {title.entitlement === "prime" ? (
            <PrimeSwooshIcon className="h-[18px] w-[44px] text-white" />
          ) : (
            <EntitlementBagIcon className="size-[15px] text-[var(--pv-yellow)]" />
          )}
        </span>

        <Link href={`/detail/${title.id}`} aria-label={title.name} className="absolute inset-0 z-[3]">
          <span className="sr-only">{title.name}</span>
        </Link>
      </div>

      {/* Information panel — docks to the bottom edge of the scaled art and
          spans its full width, so it is inset negatively on both sides. */}
      {hovered && (
        <div
          className="absolute z-[1] rounded-b-lg bg-black shadow-[0_4px_8px_2px_rgba(0,5,13,0.5)]"
          style={{
            top: CARD_H + BLEED_Y,
            left: -BLEED_X,
            right: -BLEED_X,
            width: SCALED_W,
            padding: "10px 20px 20px",
          }}
        >
          {/* Title block — 55px */}
          <div className="h-[55px]">
            <p className="truncate text-xl font-bold leading-7">{title.name}</p>
            <p className="mt-[2px] flex items-center gap-[6px] text-[13px] text-white/90">
              <EntitlementBagIcon className="size-[13px] shrink-0 text-[var(--pv-yellow)]" />
              {title.entitlement === "prime"
                ? "Watch with a Prime membership"
                : "Available with a subscription"}
            </p>
          </div>

          {/* Action row — 50px, space-between */}
          <section className="flex h-[50px] items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                href={`/detail/${title.id}?autoplay=1&t=0`}
                aria-label={`Play ${title.name}`}
                className="grid size-[42px] place-items-center rounded-full bg-white text-[#00050d] transition-transform duration-100 hover:scale-105"
              >
                <PlayIcon className="size-5" />
              </Link>
              <button
                type="button"
                aria-label="Add to Watchlist"
                className="grid size-[42px] place-items-center rounded-full bg-white/20 transition-colors duration-100 hover:bg-white/30"
              >
                <PlusIcon className="size-5" />
              </button>
            </div>
            <Link
              href={`/detail/${title.id}`}
              aria-label={`More info about ${title.name}`}
              className="grid size-[42px] place-items-center rounded-full bg-white/20 transition-colors duration-100 hover:bg-white/30"
            >
              <InfoIcon className="size-5" />
            </Link>
          </section>

          {/* Rank row — 30px, margin-top 10 */}
          {typeof rank === "number" && (
            <div className="mt-[10px] flex h-[30px] items-center text-base text-white">
              #{rank} in India
            </div>
          )}

          {/* Meta row — 20px, margin-top 15 */}
          <section className="mt-[15px] flex h-[20px] items-center gap-[10px] text-[13px] text-[var(--pv-text-muted)]">
            {title.badge && (
              <span className="rounded-[2px] bg-white px-[5px] py-[1px] text-[11px] font-bold text-[#00050d]">
                {title.badge}
              </span>
            )}
            {title.maturityRating && (
              <span className="rounded-[3px] border border-white/40 px-[5px] py-[1px] text-[11px]">
                {title.maturityRating}
              </span>
            )}
            {title.year && <span>{title.year}</span>}
            {title.runtime && <span>{title.runtime}</span>}
            {title.imdbRating && (
              <span className="flex items-center gap-1">
                <span className="rounded-[2px] bg-[var(--pv-imdb)] px-1 text-[10px] font-bold text-black">
                  IMDb
                </span>
                {title.imdbRating.toFixed(1)}
              </span>
            )}
          </section>

          {/* Synopsis — 16px / 500 / lh 19, clamped to 3 lines, margin-top 15 */}
          <p className="mt-[15px] line-clamp-3 text-base font-medium leading-[19px] text-[var(--pv-text-synopsis)]">
            {title.seasonLabel ? `${title.seasonLabel}・` : ""}
            {title.synopsis}
          </p>
        </div>
      )}
    </article>
  );
}

/**
 * Portrait (2:3) card — used by "Featured Originals" rows.
 *
 * Measured 251.2 x 376.788 at 1440. Construction is unusual: a 16:9 backdrop
 * is height-matched to the card (376.788 * 16/9 = 669.8 wide) and bleeds out
 * horizontally behind a 2:3 poster layered on top.
 */
export function PortraitCard({ title }: { title: Title }) {
  return (
    <article
      className="relative overflow-hidden rounded-lg bg-[var(--pv-card-placeholder)]"
      style={{
        width: PORTRAIT_W,
        height: PORTRAIT_H,
        transition: "width .5s cubic-bezier(0.2,0.45,0,1)",
      }}
    >
      {/* 16:9 backdrop, height-matched and horizontally overflowing. */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2"
        style={{ width: PORTRAIT_H * (16 / 9), height: PORTRAIT_H }}
        aria-hidden="true"
      >
        <Image src={title.cardImage} alt="" fill sizes="670px" className="object-cover" />
      </div>

      {/* 2:3 poster layered over it — real portrait art when available. */}
      <Link
        href={`/detail/${title.id}`}
        aria-label={title.name}
        className="absolute inset-0 flex items-center justify-center rounded-lg"
        style={{ transition: "opacity .3s cubic-bezier(0.2,0.45,0,1)" }}
      >
        <span className="relative block h-full w-full overflow-hidden rounded-lg">
          <Image
            src={title.posterImage ?? title.cardImage}
            alt={title.name}
            fill
            sizes="271px"
            className="object-cover"
          />
          <span className="pv-card-vignette pointer-events-none absolute inset-0" />
        </span>
      </Link>

      {title.badge && (
        <span
          aria-label={title.badge}
          className="absolute right-0 top-0 z-[2] rounded-bl-[3px] bg-white px-[7px] py-[3px] text-[13px] font-bold leading-[13px] text-[#00050d]"
        >
          {title.badge}
        </span>
      )}

      <span className="absolute bottom-[6px] left-[6px] z-[2]">
        <PrimeSwooshIcon className="h-[18px] w-[44px] text-white" />
      </span>
    </article>
  );
}

/** Top 10 variant — oversized outlined rank numeral to the left of the art. */
export function Top10Card({ title, rank }: { title: Title; rank: number }) {
  return (
    <div className="flex items-end">
      <span
        aria-hidden="true"
        className="-mr-[14px] select-none font-bold leading-[0.78] text-transparent"
        style={{ fontSize: "112px", WebkitTextStroke: "3px rgba(255,255,255,0.55)" }}
      >
        {rank}
      </span>
      <TitleCard title={title} rank={rank} />
    </div>
  );
}
