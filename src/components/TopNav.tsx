"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { categoryColumns, navItems } from "@/lib/mock-data";
import {
  CategoriesIcon,
  ChannelsIcon,
  ChevronDownIcon,
  SearchIcon,
} from "./icons";

/**
 * Sticky navigation bar — geometry measured element-by-element on the target.
 *
 * Layout: nav is 66px tall with 51px side padding; the inner row adds 21px.
 * Text items are 42px tall, 0 14px padding, gap 5px, radius 8px, 16px/500 with
 * 0.64px tracking. Icon buttons are 39x37 fully-rounded. Item list gap is 1px.
 *
 * Scroll behaviour is IntersectionObserver-driven off a zero-height marker at
 * the top of the document (the target's `pv-nav-intersection-marker`).
 */

/** Shared transition on every interactive nav surface. */
const NAV_TRANSITION =
  "color .1s ease-in-out, background-color .1s ease-in-out, box-shadow .1s ease-in-out";

/** The active item is not a flat fill: a radial highlight is anchored to its
 *  top edge and an upward outer glow bleeds above it. */
const ACTIVE_ITEM_STYLE: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.2)",
  backgroundImage:
    "radial-gradient(50% 50% at 50% 0px, rgba(255,255,255,0.8) 0px, rgba(0,0,0,0) 100%)",
  boxShadow: "rgba(255,255,255,0.2) 0px -4px 16px 0px",
};

const JOIN_PRIME_STYLE: React.CSSProperties = {
  backgroundColor: "rgba(26,152,255,0.8)",
  boxShadow: "rgba(26,152,255,0.2) 0px -4px 16px 0px",
};

/** Dropdown panels share one surface treatment. */
const PANEL_CLASS =
  "rounded-xl bg-[#191e25]/95 shadow-[0_4px_4px_0_rgba(0,0,0,0.3),0_8px_12px_6px_rgba(0,0,0,0.15)] backdrop-blur-[16px]";

type OpenMenu = "search" | "locale" | "categories" | "account" | null;

export function TopNav({ activeHref = "/" }: { activeHref?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<OpenMenu>(null);
  const markerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(marker);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = (menu: Exclude<OpenMenu, null>) =>
    setOpen((cur) => (cur === menu ? null : menu));

  return (
    <>
      {/* Zero-height intersection sentinel. */}
      <div ref={markerRef} aria-hidden="true" />

      <header className="sticky top-0 z-[190] h-0 text-white">
        <nav
          aria-label="Navigation Bar"
          className="absolute inset-x-0 top-0 h-[66px] px-4 md:px-[51px]"
        >
          <div className="relative h-full">
            {/* ---------------------------------------------- desktop */}
            <div
              className={cn(
                "pv-nav-surface hidden h-full items-center px-[21px] md:flex",
                scrolled && "pv-nav-glass",
              )}
            >
              {/* Brand */}
              <Link
                href="/"
                aria-label="Home"
                className="mr-[21px] block shrink-0 transition-colors duration-200 ease-in-out"
              >
                <Image
                  src="/images/brand/prime-video-logo.png"
                  alt="Prime Video"
                  width={84}
                  height={16}
                  priority
                  className="h-[16.325px] w-[84.275px] object-contain"
                />
              </Link>

              {/* Primary items */}
              <ul className="flex h-[66px] items-center gap-px">
                {navItems
                  .filter((i) => i.label !== "Subscriptions")
                  .map((item) => {
                    const active = activeHref === item.href;
                    return (
                      <li key={item.label} className="flex h-[66px] items-center justify-center">
                        <Link
                          href={item.href}
                          aria-label={item.label}
                          style={active ? ACTIVE_ITEM_STYLE : undefined}
                          className={cn(
                            "flex h-[42px] items-center justify-start gap-[5px] overflow-hidden",
                            "whitespace-nowrap rounded-lg px-[14px]",
                            "text-base font-medium tracking-[0.64px] text-white",
                          )}
                          onMouseEnter={() => setOpen(null)}
                        >
                          <span className="block h-[18.4px] leading-[18.4px]">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
              </ul>

              {/* Divider before the channels group — 2 x 24, 40% white */}
              <div className="mx-px flex h-[24px] w-[2px] items-center justify-center">
                <div className="h-[24px] w-[2px] bg-white/40" />
              </div>

              {/* Subscriptions (channels group) — icon + label, gap 5 */}
              <div className="flex h-[66px] items-center">
                <Link
                  href="/addons"
                  aria-label="Subscriptions"
                  className="flex h-[42px] items-center justify-start gap-[5px] overflow-hidden whitespace-nowrap rounded-lg px-[14px] text-base font-medium tracking-[0.64px] text-white"
                >
                  <ChannelsIcon className="size-[19px] shrink-0" />
                  <span className="block h-[18.4px] leading-[18.4px]">Subscriptions</span>
                </Link>
              </div>

              {/* ------------------------------------- right cluster */}
              <ul className="ml-auto flex h-[66px] items-center">
                {/* Search */}
                <li className="flex h-[66px] w-[39px] items-center justify-center">
                  <IconTrigger
                    label="Search Prime Video"
                    expanded={open === "search"}
                    onClick={() => toggle("search")}
                  >
                    <SearchIcon className="size-[19px]" />
                  </IconTrigger>
                </li>

                {/* Locale */}
                <li className="relative flex h-[66px] items-center justify-center">
                  <button
                    type="button"
                    aria-label="EN"
                    aria-expanded={open === "locale"}
                    onClick={() => toggle("locale")}
                    style={{ transition: NAV_TRANSITION }}
                    className="z-[191] flex h-[42px] items-center justify-start gap-[5px] overflow-hidden whitespace-nowrap rounded-lg px-[14px] text-base font-medium tracking-[0.64px] text-white"
                  >
                    EN
                    <ChevronDownIcon className="size-6 shrink-0" />
                  </button>
                  {open === "locale" && (
                    <Panel onClose={() => setOpen(null)} className="right-0 w-[420px] p-4">
                      <p className="mb-2 px-2 text-base font-bold">Language</p>
                      <ul className="grid grid-cols-2 gap-1">
                        {["English", "हिन्दी", "தமிழ்", "తెలుగు", "ಕನ್ನಡ", "മലയാളം"].map((l, i) => (
                          <li key={l}>
                            <button
                              type="button"
                              className={cn(
                                "flex h-[42px] w-full items-center rounded-lg px-[14px] text-base font-medium tracking-[0.64px]",
                                i === 0 ? "bg-white/20" : "hover:bg-white/10",
                              )}
                            >
                              {l}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </Panel>
                  )}
                </li>

                {/* Categories */}
                <li className="relative flex h-[66px] w-[39px] items-center justify-center">
                  <IconTrigger
                    label="Categories"
                    expanded={open === "categories"}
                    onClick={() => toggle("categories")}
                  >
                    <CategoriesIcon className="size-[19px]" />
                  </IconTrigger>
                  {open === "categories" && (
                    <Panel onClose={() => setOpen(null)} className="right-0 flex gap-6 p-4">
                      {categoryColumns.map((col, i) => (
                        <ul key={i} className="w-[204px]">
                          {col.map((c) => (
                            <li key={`${c.href}-${c.label}`}>
                              <Link
                                href={c.href}
                                className="flex h-[42px] items-center rounded-lg px-[14px] text-base font-medium tracking-[0.64px] hover:bg-white/10"
                              >
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ))}
                    </Panel>
                  )}
                </li>

                {/* Account & profiles */}
                <li className="relative flex h-[66px] w-[39px] items-center justify-center">
                  <IconTrigger
                    label="Profile, Settings, and Account"
                    expanded={open === "account"}
                    onClick={() => toggle("account")}
                  >
                    <span className="grid size-[26px] place-items-center rounded-full bg-[#33373d] text-xs font-bold text-white">
                      A
                    </span>
                  </IconTrigger>
                  {open === "account" && (
                    <Panel onClose={() => setOpen(null)} className="right-0 w-[204.7px] p-2">
                      <ul>
                        {[
                          { label: "Switch profiles", href: "/profiles" },
                          { label: "My Stuff", href: "/my-stuff" },
                          { label: "Settings", href: "/settings" },
                          { label: "Help", href: "/help" },
                          { label: "Sign out", href: "/signout" },
                        ].map((l) => (
                          <li key={l.href}>
                            <Link
                              href={l.href}
                              className="flex h-[42px] items-center rounded-lg px-[14px] text-base font-medium tracking-[0.64px] hover:bg-white/10"
                            >
                              {l.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </Panel>
                  )}
                </li>

                {/* Join Prime */}
                <li className="flex h-[66px] items-center justify-center">
                  <Link
                    href="/signup"
                    aria-label="Join Prime"
                    style={{ ...JOIN_PRIME_STYLE, transition: NAV_TRANSITION }}
                    className="ml-3 flex h-[42px] items-center justify-center gap-[5px] overflow-hidden whitespace-nowrap rounded-lg px-[14px] text-base font-medium tracking-[0.64px] text-white"
                  >
                    <span className="block h-[18.4px] leading-[18.4px]">Join Prime</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Search panel spans the content width, below the bar. */}
            {open === "search" && (
              <div className="absolute inset-x-0 top-[66px] z-[191] hidden md:block">
                <div className={cn(PANEL_CLASS, "mt-3 p-[21px]")}>
                  <label className="sr-only" htmlFor="pv-search">
                    Search Prime Video
                  </label>
                  <div className="flex h-[52px] items-center gap-3 rounded-lg bg-black/40 px-4">
                    <SearchIcon className="size-[19px] shrink-0 text-white/70" />
                    <input
                      id="pv-search"
                      type="search"
                      placeholder="Search"
                      autoFocus
                      className="h-full w-full bg-transparent text-base text-white outline-none placeholder:text-white/50"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close search"
                  className="fixed inset-0 -z-10 cursor-default"
                  onClick={() => setOpen(null)}
                />
              </div>
            )}

            {/* ----------------------------------------------- mobile */}
            <div
              className={cn(
                "pv-nav-surface flex h-full items-center justify-between px-3 md:hidden",
                scrolled && "pv-nav-glass",
              )}
            >
              <Link href="/" aria-label="Home">
                <Image
                  src="/images/brand/prime-video-logo.png"
                  alt="Prime Video"
                  width={84}
                  height={16}
                  priority
                  className="h-[16.325px] w-[84.275px] object-contain"
                />
              </Link>
              <div className="flex items-center gap-1">
                <IconTrigger label="Search Prime Video" onClick={() => toggle("search")}>
                  <SearchIcon className="size-[19px]" />
                </IconTrigger>
                <Link
                  href="/profiles"
                  aria-label="Profile"
                  className="flex size-[39px] items-center justify-center rounded-full"
                >
                  <span className="grid size-[26px] place-items-center rounded-full bg-[#33373d] text-xs font-bold">
                    A
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}

/**
 * 39x37 fully-rounded icon button.
 * Hover inverts it: white fill with a dark glyph, plus a soft upward glow.
 */
function IconTrigger({
  label,
  expanded,
  onClick,
  children,
}: {
  label: string;
  expanded?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={expanded}
      onClick={onClick}
      style={{ transition: NAV_TRANSITION }}
      className={cn(
        "z-[191] flex h-[37px] w-[39px] shrink-0 items-center justify-center gap-[5px]",
        "overflow-hidden rounded-full text-white",
        // Hover inverts the button and adds a soft upward glow. The colour is
        // written last so the arbitrary value parses as a single shadow.
        "hover:bg-[rgba(255,255,255,0.9)] hover:text-[#00050d]",
        "hover:shadow-[0_-4px_28px_0_rgba(255,255,255,0.2)]",
        expanded &&
          "bg-[rgba(255,255,255,0.9)] text-[#00050d] shadow-[0_-4px_28px_0_rgba(255,255,255,0.2)]",
      )}
    >
      {children}
    </button>
  );
}

/** Dropdown surface: radius 12, layered shadow, fades in over .2s, 12px below. */
function Panel({
  children,
  className,
  onClose,
}: {
  children: React.ReactNode;
  className?: string;
  onClose: () => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 z-10 cursor-default"
        onClick={onClose}
      />
      <div
        className={cn("absolute top-[54px] z-20 mt-3 animate-in fade-in duration-200", PANEL_CLASS, className)}
      >
        {children}
      </div>
    </>
  );
}
