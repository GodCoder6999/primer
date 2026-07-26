# DetailHero Specification

## Overview
- **Target file:** `src/app/detail/[id]/page.tsx` (hero band) + `src/components/DetailHero.tsx`
- **Screenshot:** `docs/design-references/target-detail-1440-hero.png`
- **Source page:** `https://www.primevideo.com/detail/0IR9VI8C4BBY3HMFMTDKFZ5RP5` (Adarsh Baal Vidyalaya, S1)
- **Interaction model:** static (hover states only). No scroll or click behaviour in the hero band.
- **Measured at:** 1440px viewport → 1425px content width (15px scrollbar).

## Root cause of the current break
The clone renders every hero element in normal flow, so the three content
groups land at unrelated vertical offsets — action buttons float mid-hero, the
synopsis block sits centred over the artwork, and the cast column overflows the
right edge. The target is a **bottom-aligned three-column band** pinned to the
bottom of a fixed-height hero.

## DOM Structure
```
section.hero                      1425 x 762, position: relative, display: flex
├── img (backdrop)                1425 x 801, object-fit: fill, anchored top
├── div.scrim-top                 inset-0, gradient
├── div.scrim-bottom              inset-0, gradient
├── h1                            absolute, top-left
└── div.hero-band                 absolute, bottom, display: flex, align-items: flex-end
    ├── div.col-left              x=72   (icon row, Watch now, Subscribe, terms)
    ├── div.col-center            x=448  (badges, synopsis, meta row)
    └── div.col-right             x=1128 (cast, rating/CC/AD badges)
```

## Computed Styles (exact values from getComputedStyle)

### Hero container
- width: 1425px (full bleed), height: 762px
- position: relative; display: flex

### Backdrop image
- rendered 1425 x 801, object-fit: fill, anchored to top
- overflows the 762px container by 39px at the bottom (hidden by overflow)

### Scrims (two stacked gradient layers, inset-0, pointer-events none)
- top:    `linear-gradient(rgba(0, 5, 13, 0.8), rgba(0, 5, 13, 0) 22.78%)`
- bottom: `linear-gradient(0deg, rgb(0, 5, 13), rgba(0, 5, 13, 0) 33.42%)`

### h1 title
- box: x=72, y=96, w=752, h=67
- fontSize 50px / lineHeight 67.2px / fontWeight 700, color rgb(255,255,255)

### Column left — x=72, width 348
Icon button row — y=501, six buttons:
- size 48x48, borderRadius 9999px, backgroundColor rgba(0, 5, 13, 0.4)
- color rgb(255,255,255); x positions 72, 132, 192, 252, 312, 372 → **gap 12px**
- order: trailer, add-to-watchlist, thumbs-up, thumbs-down, share, download

Primary CTA "Watch now" — y=565:
- 348 x 62, borderRadius 8px, backgroundColor rgb(255,255,255), color rgb(0,5,13)
- fontSize 20px / lineHeight 23px / fontWeight 500, play glyph left of label
- margin-top from icon row: 565 - 549 = 16px

Secondary CTA "Subscribe" — y=641:
- 348 x 62, borderRadius 8px, backgroundColor rgba(255,255,255,0.2), color white
- same type scale; prime wordmark left-aligned, "Subscribe" right-aligned
- margin-top: 641 - 627 = 14px

Terms text — below Subscribe, two lines, ~14px, muted white.

### Column center — x=448, width 652
- "NEW SERIES" badge: y=611, 100x19, fontSize 13px / lineHeight 13px / w700,
  backgroundColor rgb(255,255,255), color rgb(0,5,13), borderRadius 3px
- Availability text: x=604, y=613, fontSize 16px / lineHeight 16px / w700,
  color **rgb(55, 241, 163)** (green), preceded by an audio-description glyph
- Synopsis: y=655, w=652, h=75, fontSize 18px / lineHeight 25px / fontWeight 500,
  color rgb(255,255,255), **-webkit-line-clamp: 3**
- Meta row: y=746, fontSize 16px / lineHeight 16px / fontWeight 700
  - genre links: color rgb(255,255,255), underlined on hover
  - non-link items (tone, year, season count): color rgb(153,153,153)
  - separated by a `•` bullet; item x positions 448, 628, 807

### Column right — x=1128, width 225
- Cast block: y=681, 225x48, display flex, wraps to 2–3 lines
  - "Cast:" label color rgb(153,153,153)
  - names fontSize 16px / lineHeight 16px / w700, color rgb(255,255,255), underlined
- Badge row below: maturity rating pill 13px/13px w700,
  backgroundColor rgb(51,55,61), color white, borderRadius 3px; then CC and AD glyphs

### Band alignment
All three columns bottom out at y≈765 against a 762px hero — the band is
bottom-aligned, not top-aligned. This is the single most important fact in this spec.

## States & Behaviors
- **Icon buttons hover:** backgroundColor rgba(0,5,13,0.4) → lighter; ~100ms
- **Watch now hover:** slight brightness lift on the white fill
- **Genre / cast links hover:** text-decoration underline
- No scroll-triggered, click-driven, or time-driven behaviour in this band.

## Assets
- Backdrop: mirror the title's `pv-target-images` JPEG into `public/images/hero/`
- Icons: reuse `src/components/icons.tsx` (PlayIcon, PlusIcon, InfoIcon); add
  thumbs-up, thumbs-down, share, download, audio-description glyphs

## Text Content
Use the clone's existing **mock/placeholder copy** for synopsis and episode
descriptions rather than mirroring Amazon's marketing text — only structure,
geometry and styling are being cloned. Field lengths should match the target
(synopsis clamps at 3 lines, ~230 characters) so the layout behaves identically.

## Responsive Behavior
- **Desktop (1440px):** three-column bottom-aligned band as specified
- **Tablet (768px):** right cast column drops; left + center stack
- **Mobile (390px):** single column, CTAs full-width, gutter 16px
- **Gutter:** 72px at desktop, 16px at mobile (matches the rest of the clone)
