"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/types/catalog";
import { ChevronLeftIcon, ChevronRightIcon, InfoIcon, PlusIcon } from "./icons";

const ROTATE_MS = 8000;

/**
 * Hero billboard.
 *
 * Interaction model: time-driven auto-rotation with arrow/dot control.
 * Slides stack in a single CSS-grid cell and crossfade by opacity — the target
 * never translates them. Incoming slide fades over 0.4s after a 0.2s delay,
 * outgoing over 0.2s.
 */
export function HeroBillboard({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (paused || count < 2) return;
    const t = setTimeout(() => go(index + 1), ROTATE_MS);
    return () => clearTimeout(t);
  }, [index, paused, count, go]);

  return (
    <section
      className="relative mb-12"
      aria-roledescription="carousel"
      aria-label="Featured titles"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="group relative h-[576px] overflow-hidden">
        {/* Arrow zones: 72px wide, hidden until hover (opacity .3s). */}
        <HeroArrow side="left" label={`Move back to title number ${((index - 1 + count) % count) + 1}`} onClick={() => go(index - 1)} />
        <HeroArrow side="right" label={`Move forward to title number ${((index + 1) % count) + 1}`} onClick={() => go(index + 1)} />

        <ul className="grid h-full w-full grid-cols-1">
          {slides.map((slide, i) => {
            const active = i === index;
            return (
              <li
                key={slide.id}
                aria-label={`Title number ${i + 1}`}
                aria-hidden={!active}
                className={cn(
                  "relative col-start-1 row-start-1 h-full w-full overflow-x-hidden",
                  active
                    ? "z-[1] opacity-100 transition-opacity duration-[400ms] delay-200"
                    : "z-0 opacity-0 transition-opacity duration-200",
                )}
                style={{ transitionTimingFunction: "cubic-bezier(0,0,0,0)" }}
              >
                <HeroSlideView slide={slide} priority={i === 0} />
              </li>
            );
          })}
        </ul>
      </div>

      <HeroDots count={count} index={index} onSelect={go} />
    </section>
  );
}

function HeroSlideView({ slide, priority }: { slide: HeroSlide; priority: boolean }) {
  const { title } = slide;
  return (
    <div className="relative h-full w-full">
      {title.heroImage && (
        <Image
          src={title.heroImage}
          alt=""
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover object-top"
        />
      )}

      {/* Scrims: bottom fade into the page, left fade behind the copy. */}
      <div className="pv-hero-scrim-bottom pointer-events-none absolute inset-x-0 bottom-0 h-[70%]" />
      <div className="pv-hero-scrim-left pointer-events-none absolute inset-y-0 left-0 w-[62%]" />

      <div className="absolute inset-y-0 left-0 flex w-full max-w-[640px] flex-col justify-center px-4 pb-10 md:px-[72px]">
        {title.logoImage ? (
          <Image
            src={title.logoImage}
            alt={title.name}
            width={374}
            height={194}
            priority={priority}
            className="mb-4 max-h-[194px] w-auto max-w-[374px] object-contain object-left"
          />
        ) : (
          <h2 className="mb-4 text-[50px] font-bold leading-tight">{title.name}</h2>
        )}

        {slide.languageLine && (
          <p className="mb-4 text-base text-white/90">{slide.languageLine}</p>
        )}

        <div className="flex items-center gap-3">
          <Link
            href={slide.primaryCta.href}
            className="flex h-[52px] items-center whitespace-pre-line rounded-lg bg-[rgb(26_152_255_/_0.8)] px-5 text-center text-[15px] font-bold leading-[18px] transition-colors duration-100 hover:bg-[rgb(26_152_255)]"
          >
            {slide.primaryCta.label}
          </Link>
          <button
            type="button"
            aria-label="Add to Watchlist"
            className="grid size-[42px] place-items-center rounded-full bg-white/20 transition-colors duration-100 hover:bg-white/30"
          >
            <PlusIcon className="size-5" />
          </button>
          <Link
            href={`/detail/${title.id}`}
            aria-label={`More info about ${title.name}`}
            className="grid size-[42px] place-items-center rounded-full bg-white/20 transition-colors duration-100 hover:bg-white/30"
          >
            <InfoIcon className="size-5" />
          </Link>
        </div>

        {slide.entitlementNote && (
          <p className="mt-3 flex items-center gap-2 text-[13px] text-white/90">
            <span className="grid size-[15px] place-items-center rounded-[2px] bg-[var(--pv-yellow)] text-[9px] font-bold text-[#00050d]">
              ▸
            </span>
            {slide.entitlementNote}
          </p>
        )}
      </div>

      {title.maturityRating && (
        <span className="absolute bottom-4 right-4 rounded-[3px] border border-white/40 px-2 py-[2px] text-[12px] text-white/90">
          {title.maturityRating}
        </span>
      )}
    </div>
  );
}

function HeroArrow({
  side,
  label,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        "absolute inset-y-0 z-20 flex w-[72px] items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100",
        side === "left" ? "left-0" : "right-0",
      )}
      style={{ transitionTimingFunction: "cubic-bezier(0.2,0.45,0,1)" }}
    >
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className="grid size-[33px] place-items-center text-white transition-colors duration-300 ease-in-out hover:text-white/70"
      >
        {side === "left" ? (
          <ChevronLeftIcon className="size-[33px]" />
        ) : (
          <ChevronRightIcon className="size-[33px]" />
        )}
      </button>
    </div>
  );
}

/**
 * Pagination dots. The target shrinks dots toward the edges of the window
 * rather than rendering them all at equal size:
 *   active 14x7 | near 7x7 | edge 4x4 | beyond 0x0
 */
function HeroDots({
  count,
  index,
  onSelect,
}: {
  count: number;
  index: number;
  onSelect: (i: number) => void;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  return (
    <div className="relative z-10 h-[7px]">
      <ul ref={trackRef} className="flex items-center justify-center">
        {Array.from({ length: count }, (_, i) => {
          const distance = Math.abs(i - index);
          const size =
            distance === 0 ? "active" : distance <= 2 ? "near" : distance === 3 ? "edge" : "hidden";
          return (
            <li key={i} className="flex items-center">
              <button
                type="button"
                aria-label={`Go to title number ${i + 1}`}
                aria-current={i === index}
                onClick={() => onSelect(i)}
                className={cn(
                  "rounded-full transition-[background-color,width,height,margin] duration-200 ease-linear",
                  size === "active" && "mr-[9px] h-[7px] w-[14px] bg-white",
                  size === "near" && "mr-[9px] size-[7px] bg-white/40",
                  size === "edge" && "mr-[9px] size-[4px] bg-white/40",
                  size === "hidden" && "mr-0 size-0 bg-white/40",
                )}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
