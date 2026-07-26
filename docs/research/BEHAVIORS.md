# Behaviors — primevideo.com (captured 2026-07-25, 1440px, IN storefront)

All values from `getComputedStyle()` on the live site, or from the raw
`DVWebClient_app.926cfaf8.css` stylesheet.

## Global

- Base background `#00050d` (`theme-color` meta matches). Body text `#fff`.
- Font stack: `"Amazon Ember", "Amazon Arabic Ember", Arial, sans-serif`.
- **No smooth-scroll library.** No `.lenis`, no Locomotive, no `scroll-behavior`
  on the container. Native scrolling — do NOT add Lenis.
- No page-level `scroll-snap`. Snap exists only inside carousel rows (`scroll-snap-type: x`).
- Page gutter is `--dv-carousel-column-margin: 72px` at desktop.

## Navigation bar — scroll-driven glass state

**Interaction model: scroll-driven, IntersectionObserver.**

An empty `<div data-testid="pv-nav-intersection-marker">` sits at the very top of
the document. When it leaves the viewport the nav gains its scrolled state.

| | State A (y = 0) | State B (scrolled) |
|---|---|---|
| `nav` class | `gi7FFo` | `gi7FFo Zp_pQL` |
| inner class | `_vATAX` | `_vATAX _dldBg` |
| `::before` background | — (absent) | `rgba(25, 30, 37, 0.8)` |
| `::before` backdrop-filter | `none` | `blur(16px)` |

The glass is painted by a `::before` pseudo-element (`z-index: -1`), not by the
nav's own background:

```css
._vATAX._dldBg { border-radius: 0 0 12px 12px;
  box-shadow: 0 4px 4px 0 rgba(0,0,0,.3), 0 8px 12px 6px rgba(0,0,0,.15); }
._vATAX._dldBg:before { content:""; position:absolute; inset:0; z-index:-1;
  backdrop-filter: blur(16px); background-color: rgba(25,30,37,.8);
  border-radius: 0 0 12px 12px; transition: background-color .1s linear; }
```

Note `.gi7FFo:not(.Zp_pQL){background-color:#00050d}` exists in the sheet but the
**computed** nav background is `rgba(0,0,0,0)` in both states on the home page —
the hero sits behind a transparent nav. Trust the computed value.

- Nav height `--dv-pvnav-height: 66px`, `position: sticky; top: 0; z-index: 190`.
- Nav horizontal padding `51px`; inner row adds `21px` (`--fable-foundation-spacing-150`).

### Nav item hover
`transition: color .1s ease-in-out, background-color .1s ease-in-out, box-shadow .1s ease-in-out`
Active item background `rgba(255,255,255,0.2)`, `border-radius: 8px`, height `42px`.

## Hero billboard — time + click driven crossfade

**Interaction model: auto-rotating carousel with click/arrow control. NOT scroll-driven.**

- `<ul>` is `display: grid` with a single column — every slide stacks in the same
  cell and crossfades by opacity. No translation, no slide.
- Incoming slide: `opacity: 1; z-index: 1; transition: opacity .4s cubic-bezier(0,0,0,0) .2s`
- Outgoing slide: `opacity: 0; z-index: 0; transition: opacity .2s cubic-bezier(0,0,0,0)`
- 5 slides are kept in the DOM (windowed); aria labels reveal ~12 titles total
  ("Move forward to title number 2", "Title number 11/12/1/2/3").
- Hero block `height: 576px`, wrapper `margin-bottom: 48px`.

### Arrow zones
`72px` wide, full height, `position: absolute`, `z-index: 20`,
`opacity: 0` by default → shown on hover,
`transition: opacity .3s cubic-bezier(0.2, 0.45, 0, 1)`. Button itself `33x33`.

### Pagination dots
`transition: background .2s linear, width .2s linear, height .2s linear, margin-inline-end .2s linear`

| Dot | Size | Background |
|---|---|---|
| Active | `14 x 7` | `#fff` |
| Inactive | `7 x 7` | `rgba(255,255,255,.4)` |
| Edge (shrinking) | `4 x 4` | `rgba(255,255,255,.4)` |
| Beyond edge | `0 x 0` | — |

`border-radius: 10000px`, `margin-right: 9px`. The shrink-at-the-edges pattern is
required — dots do not all render at equal size.

## Carousel rows — horizontal scroll + snap

**Interaction model: click arrows + native horizontal scroll with x snap.**

- Row wrapper `margin-bottom: 42px`.
- Track `<ul>`: `display:flex; overflow-x: scroll; scroll-snap-type: x;`
  `padding: 150px 72px 600px`. The oversized vertical padding exists so the
  hover panel can overflow without being clipped — reproduce it (with the
  parent's `overflow-x: hidden`) or hover cards will be cut off.
- Arrow buttons: `62px` wide, full track height, `background: rgba(0,5,13,.5)`,
  `z-index: 20`, `transition: color .3s ease-in-out`.
  Prev `border-radius: 0 8px 8px 0`; next `border-radius: 8px 0 0 8px`.
  Labels are dynamic: "previous 5 titles" / "next 5 titles" (count = visible cards).
- Row heading: `20px / 700 / line-height 28px`, white, `margin-right: 36px`.

## Title card — hover expansion

**Interaction model: hover.**

- Card `270.4 x 152.1` (16:9), `margin-right: 10px` (`--dv-carousel-column-gap`).
- Art container `border-radius: 8px`, placeholder background `#33373d`.
- Radial vignette overlay is an inline SVG data-URI (`#00050d`, stop `.368` at
  opacity 0 → stop `.6` at opacity `.7`), rotated `115.982deg`.
- Badge ("NEW SERIES", "TOP 10", …): `13px / 700 / line-height 13px`,
  background `#fff`, color `#00050d`, `padding: 3px 7px`,
  `border-radius: 0 3px`, `transition: opacity .3s cubic-bezier(0.2,.45,0,1) .1s`.

### Hover state — the card SCALES, it does not merely gain a panel

This was initially mis-read from synthetic `mouseover` events, which leave the
card mid-transition. Verified with a real `page.mouse.move`:

| | Rest | Hover |
|---|---|---|
| art wrapper `transform` | `scale(1)` | `scale(1.56)` |
| art wrapper `transition` | `transform .1s cubic-bezier(.32,0,.67,0)` | `transform .3s cubic-bezier(0.2,0.45,0,1) .1s` |
| art radius | `8px` | `8px 8px 0 0` |
| `<article>` overflow | `hidden` | `visible` |
| `<article>` z-index | `0` | `2` |

The scale-up is slow and delayed; the return to rest is deliberately fast
(`.1s`). `transform-origin` is the card's centre.

Derived geometry for a `270.4 x 152.1` card (scale factor `1.56`):

```
scaled   = 421.8 x 237.3
bleed-x  = (421.8 - 270.4) / 2 = 70.3   -> panel inset left/right: -70.3
bleed-y  = (237.3 - 152.1) / 2 = 42.6   -> panel top: 152.1 + 42.6 = 194.7
```

Confirmed against the live 251.2-wide card: panel `top: 180.863px`,
`left/right: -70.33px`, matching `141.3 + (141.3 * .56)/2 = 180.86`.

The panel docks flush to the **scaled** art's bottom edge and spans its full
width: `background: #000`, `padding: 10px 20px 20px`,
`border-radius: 0 0 8px 8px`, `box-shadow: 0 4px 8px 2px rgba(0,5,13,.5)`.

Panel contents, in order: title + entitlement line (`55px`, title `20px/700`),
action row (`50px`, `space-between`), rank row (`30px`, `margin-top: 10px`),
meta row (`20px`, `margin-top: 15px`), synopsis
(`16px / 500 / line-height 19px`, `#f1f1f1`, `margin-top: 15px`, 3-line clamp).

**Clipping:** the row viewport must use `overflow-x: clip` with
`overflow-y: visible`. `overflow-x: hidden` forces the other axis to `auto`,
which clips the expansion. The track's `padding: 150px 72px 600px` reserves the
room inside the scroller.

## Footer

`position: sticky`, `padding: 24px`, `background: #00050d`,
`font-size: 15px`, `line-height: 20px`, text `#8197a4`, centered.
Links `#79b8f3`, `transition: color .2s ease-in-out`. Brand logo `107 x 32`,
`margin-bottom: 14px`.

## Not present (verified absent — do not build)

- Smooth-scroll library, page scroll-snap, parallax, scroll-triggered entrance
  animations on rows, dark→light section transitions, `animation-timeline`.
