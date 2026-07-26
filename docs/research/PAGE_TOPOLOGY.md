# Page Topology — primevideo.com home (1440px, IN storefront)

Total document height at capture: **2874px**.

## Layer stack

| z-index | Layer |
|---|---|
| 190 | `header#pv-navigation-bar` (sticky, top 0) |
| 20 | Hero arrow zones; carousel row arrow buttons |
| 3 | Card link overlay (`a`) |
| 2 | Card badge; card CTA button; carousel track |
| 1 | Active hero slide; row header; card bottom gradient |
| 0 | Inactive hero slides; page flow |

## Vertical order

| # | Section | y | Size | Interaction |
|---|---|---|---|---|
| 1 | Nav bar | 0 | full × 66 | scroll-driven glass (IntersectionObserver) |
| 2 | Hero billboard | 0 | full × 576 (+48 margin) | time-driven crossfade + arrows/dots |
| 3 | Top 10 row (numbered) | 631 | full × 196 | horizontal scroll + snap |
| 4–8 | Standard rows ×5 | 869 → 1802, pitch ≈233 | full × 191 | horizontal scroll + snap |
| 9 | "See more" button | below rows | centered | click |
| 10 | Footer | 2753 | full × 122 | static, sticky |

The nav overlaps the hero — the hero starts at y=0, beneath a transparent nav.

## Grid

```
--dv-carousel-column-margin : 72px   /* page gutter */
--dv-carousel-column-gap    : 10px   /* gap between cards */
--dv-carousel-column-number : 12
--dv-page-margin            : 72px
--dv-page-column-gap        : 24px
--dv-pvnav-height           : 66px
```

Card width derives from a 12-column track:
`calc((100vw - 72px*2 - 11*10px) / 12)` → cards span multiples of that column.
Observed standard card: **270.4 × 152.1** (16:9), i.e. ~2 columns + gap.

## Row anatomy

```
div.UI3iHJ                      row wrapper, margin-bottom 42px
└ section
  ├ section.QHjixV              header row, height 39 (44 for Top 10)
  │ └ span.TvxgS1               heading, margin-left 72, padding-bottom 11
  │   └ h2                      20px/700, lh 28
  └ div.vJYTdI…                 grid, cols "62px 62px", space-between,
                                overflow-x hidden, height 152.1
    ├ button (prev)             62 wide, rgba(0,5,13,.5), radius 0 8 8 0
    ├ ul.lw1NJZ                 flex, overflow-x scroll, snap x,
    │                           padding 150px 72px 600px
    │ └ li.NQEYQF ×20           270.4×152.1, margin-right 10
    └ button (next)             62 wide, radius 8 0 0 8
```

## Content volatility

Row titles and their contents are **personalized and geo-gated** (this capture is
the India storefront: "Top 10 with Prime", "Top TV", "Drama TV",
"Hard-hitting dramas", "Top movies", "Recently added TV"). Row order changed
between two loads during capture. Treat all row content as a frozen snapshot in
mock data, per TARGET.md.

## Component build list

| Component | File | Notes |
|---|---|---|
| `TopNav` | `src/components/TopNav.tsx` | sticky, glass on scroll, Categories flyout |
| `HeroBillboard` | `src/components/HeroBillboard.tsx` | crossfade, arrows, dots |
| `PaginationDots` | in HeroBillboard | shrink-at-edge sizing |
| `CarouselRow` | `src/components/CarouselRow.tsx` | scroll + snap + arrows |
| `TitleCard` | `src/components/TitleCard.tsx` | badge, vignette, hover panel |
| `Top10Card` | `src/components/Top10Card.tsx` | numeral variant |
| `SiteFooter` | `src/components/SiteFooter.tsx` | static |

Secondary surfaces (per TARGET.md, built from mock data — no live login):
browse grid, title detail, profile switcher, My Stuff.
