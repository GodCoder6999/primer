import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

type IconProps = SVGProps<SVGSVGElement>;

/** Icons traced from the target's inline SVGs. All inherit currentColor. */

/** Search — lens centred at (10,10) r≈6, handle running to (21.7,21.7). */
export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M16.4 16.4 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="m6 9.5 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="m15 5-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Categories — 3x3 grid of dots at x/y ∈ {5,12,19}, radius 2. */
export function CategoriesIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      {[5, 12, 19].map((y) =>
        [5, 12, 19].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2" />),
      )}
    </svg>
  );
}

/** Channels — three rounded squares plus a "+" in the fourth quadrant. */
export function ChannelsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      {[
        [3, 3],
        [14, 3],
        [3, 14],
      ].map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width="7"
          height="7"
          rx="1"
          stroke="currentColor"
          strokeWidth="2"
        />
      ))}
      <path
        d="M17.5 14v7M14 17.5h7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 10.8v6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="12" cy="7.6" r="1.15" fill="currentColor" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M7.5 4.7c0-.6.65-.98 1.17-.68l11 6.98c.5.32.5 1.06 0 1.38l-11 6.98a.8.8 0 0 1-1.17-.68z" />
    </svg>
  );
}

/** Detail-page action row: trailer, rate, share, download. */
export function TrailerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="2.8" y="5.2" width="18.4" height="13.6" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10.2 9.4v5.2l4.4-2.6z" fill="currentColor" />
    </svg>
  );
}

export function ThumbUpIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M7.4 10.6 11.6 3a2 2 0 0 1 2.8 1.9v4.3h4.3a2 2 0 0 1 1.95 2.45l-1.4 6.2A2 2 0 0 1 17.3 20H7.4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M7.4 10.6v9.4H4.9a1.5 1.5 0 0 1-1.5-1.5v-6.4a1.5 1.5 0 0 1 1.5-1.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function ThumbDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M16.6 13.4 12.4 21a2 2 0 0 1-2.8-1.9v-4.3H5.3a2 2 0 0 1-1.95-2.45l1.4-6.2A2 2 0 0 1 6.7 4h9.9z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M16.6 13.4V4h2.5a1.5 1.5 0 0 1 1.5 1.5v6.4a1.5 1.5 0 0 1-1.5 1.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="18" cy="5.4" r="2.8" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="6" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="18" cy="18.6" r="2.8" stroke="currentColor" strokeWidth="1.7" />
      <path d="m8.5 10.7 7-3.9m-7 6.5 7 3.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 3.6v11.2m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.4 17.4v1.4a1.6 1.6 0 0 0 1.6 1.6h12a1.6 1.6 0 0 0 1.6-1.6v-1.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/** Audio-description speaker, shown beside the green availability line. */
export function AudioDescriptionIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M4 9.4h3.2L11.4 6v12L7.2 14.6H4z" fill="currentColor" />
      <path d="M14.6 9.2a4 4 0 0 1 0 5.6M17.4 6.6a7.6 7.6 0 0 1 0 10.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/** Trending arrow beside the "Top 10 with Prime" heading. */
export function TrendingIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m7.6 14.6 3.1-3.3 2.2 2 3.5-3.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.6 9.2h3v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Entitlement chip: a small shopping-bag glyph in the target's yellow. */
export function EntitlementBagIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M4.6 8h14.8l-1.15 11.1a1.6 1.6 0 0 1-1.6 1.4H7.35a1.6 1.6 0 0 1-1.6-1.4z" fill="currentColor" />
      <path d="M8.6 9.4V6.9a3.4 3.4 0 0 1 6.8 0v2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <rect x="6" y="4.5" width="4" height="15" rx="1" />
      <rect x="14" y="4.5" width="4" height="15" rx="1" />
    </svg>
  );
}

/** Seek back 10s — circular arrow with a "10" in the bowl. */
export function SeekBackIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 5.5a7.5 7.5 0 1 1-7.3 9.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M12 2.5 8.6 5.5 12 8.5z" fill="currentColor" />
      <text x="12" y="16" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="currentColor">
        10
      </text>
    </svg>
  );
}

export function SeekForwardIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 5.5a7.5 7.5 0 1 0 7.3 9.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M12 2.5 15.4 5.5 12 8.5z" fill="currentColor" />
      <text x="12" y="16" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="currentColor">
        10
      </text>
    </svg>
  );
}

export function VolumeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" />
      <path d="M15.5 9a4.2 4.2 0 0 1 0 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M18.2 6.6a7.8 7.8 0 0 1 0 10.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

export function SubtitlesIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M6.5 12.5h4M13.5 12.5h4M6.5 15.5h3M12.5 15.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Player fullscreen — opposing diagonal arrows. */
export function FullscreenIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M20 4 14 10M4 20l6-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M14.5 4H20v5.5M9.5 20H4v-5.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Settings gear. */
export function SettingsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="3.1" stroke="currentColor" strokeWidth="1.9" />
      <path
        d="M12 2.6a1 1 0 0 1 .98.8l.28 1.4a7.4 7.4 0 0 1 1.7.98l1.34-.48a1 1 0 0 1 1.2.45l1.1 1.9a1 1 0 0 1-.22 1.26l-1.07.92a7.5 7.5 0 0 1 0 1.96l1.07.92a1 1 0 0 1 .22 1.26l-1.1 1.9a1 1 0 0 1-1.2.45l-1.34-.48a7.4 7.4 0 0 1-1.7.98l-.28 1.4a1 1 0 0 1-.98.8h-2.2a1 1 0 0 1-.98-.8l-.28-1.4a7.4 7.4 0 0 1-1.7-.98l-1.34.48a1 1 0 0 1-1.2-.45l-1.1-1.9a1 1 0 0 1 .22-1.26l1.07-.92a7.5 7.5 0 0 1 0-1.96l-1.07-.92a1 1 0 0 1-.22-1.26l1.1-1.9a1 1 0 0 1 1.2-.45l1.34.48a7.4 7.4 0 0 1 1.7-.98l.28-1.4a1 1 0 0 1 .98-.8z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Picture-in-picture — frame with an inset panel bottom-right. */
export function PipIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="2.6" y="4.6" width="18.8" height="14.8" rx="2.2" stroke="currentColor" strokeWidth="1.9" />
      <rect x="12" y="11.6" width="7.5" height="6" rx="1.2" fill="currentColor" />
    </svg>
  );
}

/** IMDb wordmark badge used in the player's X-Ray strip. */
export function ImdbBadge(props: { className?: string }) {
  return (
    <span
      className={cn(
        // Outlined treatment: transparent chip, light border and light text —
        // not the solid gold mark used elsewhere on the site.
        "inline-flex items-center rounded-[4px] border-2 border-white/85 px-[6px] py-[2px]",
        "text-[15px] font-bold leading-none tracking-tight text-white/85",
        props.className,
      )}
    >
      IMDb
    </span>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="m5 12.5 4.6 4.5L19 7.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

/** "prime" swoosh wordmark used on card entitlement chips and the hero. */
export function PrimeSwooshIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 64 26" fill="none" aria-hidden="true" {...props}>
      <text
        x="0"
        y="14"
        fill="currentColor"
        fontFamily="var(--font-amazon-ember), Arial, sans-serif"
        fontSize="15"
        fontWeight="700"
        letterSpacing="-0.4"
      >
        prime
      </text>
      <path
        d="M2 20.2c9.5 5 26.5 5.6 40.2.4"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M40.4 17.6c2.6-.7 5 .1 4.2 1.9-.5 1.2-2 2-3.2 2.3" fill="currentColor" />
    </svg>
  );
}
