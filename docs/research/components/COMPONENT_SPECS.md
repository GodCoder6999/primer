# Component Specifications

Consolidated rather than one file per component — every value below is from
`getComputedStyle()` on the live site or from the target's raw stylesheet.
See `../BEHAVIORS.md` for the full behaviour matrix.

---

## TopNav → `src/components/TopNav.tsx`

**Interaction model:** scroll-driven (IntersectionObserver) + click (Categories flyout).

| Property | Value |
|---|---|
| header | `position: sticky; top: 0; z-index: 190; height: 0` |
| nav | `height: 66px; padding: 0 51px; position: absolute` |
| inner row | `display: flex; align-items: center; padding: 0 21px` |
| logo | `84.275 x 16.325`, `margin-right: 21px`, natural `320 x 62` |
| item list | `<ul>` with `gap: 1px`; each `<li>` `height: 66px`, centred |
| text item | `height: 42px`, `padding: 0 14px`, `gap: 5px`, `radius: 8px`, `16px / 500`, `letter-spacing: 0.64px`, `overflow: hidden`, `white-space: nowrap`, `justify-content: start` |
| item label | inner `<span>`, `height: 18.4px` |
| divider | `2 x 24`, `margin: 0 1px`, `background: rgba(255,255,255,0.4)` |
| Subscriptions | channels icon `19 x 19` + `gap: 5px` + label |
| icon button | `39 x 37`, `border-radius: 10000px`, trigger `z-index: 191` |
| locale button | `79.1 x 42`, `padding: 0 14px`, caret `24 x 24` |
| Join Prime | `113.3 x 42`, `margin-left: 12px`, `justify-content: center` |
| transition | `color .1s ease-in-out, background-color .1s ease-in-out, box-shadow .1s ease-in-out` |

### The active item is not a flat fill

Three layers stack — a translucent base, a radial highlight pinned to the top
edge, and an upward outer glow that bleeds above the pill:

```css
background-color: rgba(255,255,255,0.2);
background-image: radial-gradient(50% 50% at 50% 0px,
                    rgba(255,255,255,0.8) 0px, rgba(0,0,0,0) 100%);
box-shadow: rgba(255,255,255,0.2) 0px -4px 16px 0px;
```

Join Prime uses the same construction in blue:
`background: rgba(26,152,255,0.8)`, `box-shadow: rgba(26,152,255,0.2) 0 -4px 16px 0`.

### Hover

- **Text items: no background change.** Verified — rest and hover are both
  `rgba(0,0,0,0)` with no shadow. Do not invent a hover fill.
- **Icon buttons invert:** `background: rgba(255,255,255,0.9)`,
  `color: rgb(0,5,13)`, `box-shadow: 0 -4px 28px 0 rgba(255,255,255,0.2)`.

**Scrolled state** (`_dldBg`): `::before` with `background: rgba(25,30,37,.8)`,
`backdrop-filter: blur(16px)`, `border-radius: 0 0 12px 12px`,
`box-shadow: 0 4px 4px rgba(0,0,0,.3), 0 8px 12px 6px rgba(0,0,0,.15)`.

### Order and measured x-positions (1440px)

logo `72` · Home `177.3` · Free to me `253.1` · Movies `367.7` · TV shows `452.1`
· Live TV `556.6` · divider `644.7` · Subscriptions `647.7` · search `1031.4`
· EN `1070.4` · Categories `1149.5` · profile `1188.5` · Join Prime `1239.5`.

### Dropdowns

All share: `border-radius: 12px`, `margin-top: 12px`, `position: fixed`,
`opacity: 0 → 1` over `.2s`,
`box-shadow: 0 4px 4px 0 rgba(0,0,0,.3), 0 8px 12px 6px rgba(0,0,0,.15)`.

| Panel | Size | Notes |
|---|---|---|
| Search | `1140 x 156` | `padding: 21px` |
| Locale | `860.4 x 427` | |
| Categories | `706.8 x 482` | 3 columns, `204px` wide, `42px` rows |
| Account | `204.7 x 237` | |

### Icons (all `viewBox="0 0 24 24"`, rendered `19 x 19`, `currentColor`)

Search (lens at `(10,10)` r≈6 + handle to `(21,21)`) · Categories (3×3 dots at
x/y ∈ {5,12,19}, r=2) · Channels (3 rounded squares + a `+`) · Caret Down.

---

## HeroBillboard → `src/components/HeroBillboard.tsx`

**Interaction model:** time-driven auto-rotation + arrows/dots. Not scroll-driven.

| Property | Value |
|---|---|
| wrapper | `height: 583px`, `margin-bottom: 48px` |
| stage | `height: 576px` |
| slide list | `display: grid; grid-template-columns: 1fr` (all slides share one cell) |
| active slide | `opacity: 1; z-index: 1; transition: opacity .4s cubic-bezier(0,0,0,0) .2s` |
| inactive slide | `opacity: 0; z-index: 0; transition: opacity .2s cubic-bezier(0,0,0,0)` |
| arrow zone | `width: 72px`, full height, `z-index: 20`, `opacity: 0` → 1 on hover, `.3s cubic-bezier(0.2,0.45,0,1)` |
| arrow button | `33 x 33` |
| logo art | up to `374 x 194` |

**Dots** — `transition: background .2s linear, width .2s linear, height .2s linear, margin-inline-end .2s linear`:
active `14x7 #fff` · near `7x7 rgba(255,255,255,.4)` · edge `4x4` · beyond `0x0`;
`border-radius: 10000px`, `margin-right: 9px`.

---

## CarouselRow → `src/components/CarouselRow.tsx`

**Interaction model:** arrow clicks + native horizontal scroll with x snap.

| Property | Value |
|---|---|
| wrapper | `margin-bottom: 42px` |
| header row | `height: 39px` (44px for Top 10), `margin-right: 72px` |
| heading | `20px / 700 / lh 28`, `margin-right: 36px`, `margin-left: 72px`, `padding-bottom: 11px` |
| viewport | `overflow-x: hidden`, `height: 152.1px` |
| track | `display: flex; overflow-x: scroll; scroll-snap-type: x; padding: 150px 72px 600px` |
| arrow | `width: 62px`, `background: rgba(0,5,13,.5)`, `z-index: 20`, `transition: color .3s ease-in-out` |
| arrow radius | prev `0 8px 8px 0` · next `8px 0 0 8px` |
| arrow label | `"previous N titles"` / `"next N titles"`, N = visible card count |

The oversized track padding lets the card hover panel overflow the clipped
viewport. **`scroll-padding-left` must equal the gutter**, otherwise a
`snap-start` target parks `scrollLeft` at 72 and the gutter disappears.

---

## TitleCard → `src/components/TitleCard.tsx`

**Interaction model:** hover.

| Property | Value |
|---|---|
| card | `270.4 x 152.1` (16:9), `margin-right: 10px` |
| art | `border-radius: 8px`, placeholder `#33373d` |
| badge | `13px / 700 / lh 13`, `background: #fff`, `color: #00050d`, `padding: 3px 7px`, `radius: 0 3px` |
| badge transition | `opacity .3s cubic-bezier(0.2,.45,0,1) .1s` |
| vignette | radial `#00050d`, stop `.368` @ 0 → stop `.6` @ `.7`, `rotate(115.982deg)` |

**Hover — the art scales, it does not merely gain a panel:**

| | Rest | Hover |
|---|---|---|
| art `transform` | `scale(1)` | `scale(1.56)` (origin centre) |
| art `transition` | `transform .1s cubic-bezier(.32,0,.67,0)` | `transform .3s cubic-bezier(0.2,0.45,0,1) .1s` |
| art radius | `8px` | `8px 8px 0 0` |
| `<article>` | `overflow: hidden; z-index: 0` | `overflow: visible; z-index: 2` |

Geometry (`W=270.4`, `H=152.1`, scale `1.56`) → scaled `421.8 x 237.3`;
panel `top: H + (H*.56)/2 = 194.7`, `left/right: -(W*.56)/2 = -70.3`,
`width: 421.8`. Panel: `background: #000`, `padding: 10px 20px 20px`,
`border-radius: 0 0 8px 8px`, `box-shadow: 0 4px 8px 2px rgba(0,5,13,.5)`.
Contents: title + entitlement `55px` → actions `50px` (`space-between`)
→ rank `30px` (`mt 10`) → meta `20px` (`mt 15`)
→ synopsis `16px / 500 / lh 19`, `#f1f1f1`, `mt 15`, 3-line clamp.

Row viewport needs `overflow-x: clip` + `overflow-y: visible` — `hidden`
forces the cross axis to `auto` and clips the expansion.

**Top10 variant:** oversized outlined rank numeral left of the art.

### Card type census (surveyed across 7 pages at 1440)

Measured every `ul.lw1NJZ > li`. Only **three** are real card types — the rest
are layout artifacts and were deliberately not built as components:

| Ratio | Size | Verdict |
|---|---|---|
| `1.78` | `251.2 x 141.3` | **Standard 16:9.** The workhorse, every page. |
| `0.67` | `251.2 x 376.8` | **Portrait 2:3.** "Featured Originals" rows, home + `/movie` + `/kids`. |
| `2.48` | `350 x 141.3` | Top 10 — standard card **plus the numeral gutter**, not a distinct card. |
| `2.29` | `323.2 x 141.3` | **Artifact.** Last `<li>` in a row: `padding-right: 72px; margin-right: -72px` (end spacer). `323.2 = 251.2 + 72`. |
| `2.13` / `2.99` | `301` / `422 x 141.3` | **Artifact.** Hover-scaled states (`422 ≈ 270.4 × 1.56`). |

### PortraitCard → 2:3

`251.2 x 376.788`, `margin-right: 10px`, `border-radius: 8px`,
`transition: width .5s cubic-bezier(0.2,0.45,0,1)`.

Construction is unusual and worth preserving: a **16:9 backdrop is
height-matched to the card** (`376.788 × 16/9 = 669.8` wide) so it bleeds well
past both edges, with a 2:3 poster (`aspect-ratio: 2/3`, `object-fit: cover`,
`transition: opacity .3s cubic-bezier(0.2,0.45,0,1)`) layered over it.

## Category / listing page shapes

| Route | h1 | Hero | Rows | Layout |
|---|---|---|---|---|
| `/categories` | "Categories" | no | 0 | tile grids only |
| `/genre/[slug]` | genre name | **no** | 7 | rows: Movies, TV shows, Shop: Movies to rent, Popular movies, Popular TV, Shop: Popular … ×2 |
| `/kids` | "Kids" | **yes** | 5 | includes a portrait "Featured Originals for kids" row |
| `/collection/[slug]` | collection name | no | 3 | rows only |

Genre pages carry **no filter/sort chips** — chips detected near the top of
those pages were nav-bar false positives.

---

## SiteFooter → `src/components/SiteFooter.tsx`

**Interaction model:** static (link hover only).

`padding: 24px`, `background: #00050d`, `font-size: 15px`, `line-height: 20px`,
`color: #8197a4`, centred. Logo `107 x 32`, `margin-bottom: 14px`.
Links `#79b8f3`, `transition: color .2s ease-in-out`.
Items: Terms and Privacy Notice · Send us feedback · Help · © line.

---

## DetailTabs → `src/components/DetailTabs.tsx`

**INTERACTION MODEL: scroll-to-section + scroll-spy. NOT content swapping.**

This was initially built wrong (click-to-swap panels). Verified on the target:
clicking a tab **scrolls the page**, the URL never changes, and every section
stays mounted throughout — the episode headings remain in the DOM while
"Related" is active.

| Click | Target scroll position |
|---|---|
| Episodes | `y = 792` |
| Related | `y = 1942` |
| Details | `y = 3167` |

The active tab also updates on its own during **manual** scrolling
(y=600/1200 → Episodes, y=1900/2400/2900 → Related), so an
IntersectionObserver drives the state, not just the click handler.

| Property | Value |
|---|---|
| strip | `height: 66px`, **`position: static`** — it does not stick |
| label | `18px / 500`, `letter-spacing: 1.08px` |
| label colour | `#fff` active, `#999` idle |
| label transition | `color .3s` |
| indicator | `::after`, `height: 3px`, white, spans the **full tab width** |
| indicator width | 82.05px on "Episodes", 71.41px on "Related" (i.e. = tab width) |

**Implementation trap:** the scroll-spy observer will fight the click. A fixed
timeout lock is not sufficient — a long smooth scroll outlasts it and the
observer snaps the highlight to whichever section it passes through
(clicking "Details" landed on "Related"). Release the lock on the `scrollend`
event, with a ~2s timeout only as a fallback.

## Nav destinations — measured page shapes

Probed live. They are **not** all the same layout:

| Route | h1 | Hero | Rows | Extra |
|---|---|---|---|---|
| `/movie` | "Movies" | 5 slides | 6 | — |
| `/tv` | "TV shows" | 5 slides | 6 | leads with a Top-10 row |
| `/collection/streamfree` | none | 5 slides | 17 | hero carries the identity |
| `/addons` | none | **1 slide** | 6 | not a rotating carousel |
| `/livetv` | — | **none** | 1 | schedule (EPG) grid |
| `/categories` | "Categories" | none | 0 | tile grids only |

Shared shell → `src/components/StorefrontPage.tsx` (nav + optional hero + rows
+ footer) covers Movies / TV shows / Free to me / Subscriptions.

### CategoryTileGrid → `src/components/CategoryTileGrid.tsx`

5 columns × `248.15px`, `gap: 10px`, tile `248.15 x 139.587` wrapping 16:9 art
with a `20px / 700` label over a bottom scrim. Two sections: Genres (11 tiles)
and Featured collections (5).

### LiveScheduleGrid → `src/components/LiveScheduleRow.tsx`

The target lays each channel out as a grid
(`grid-template-columns: 132px 80px 506.4px 506.4px 80px`, `column-gap: 12px`,
row height `196px`): a `132px` logo column, a `148px` tall programme strip, and
a `48px` header of half-hour labels led by "On now". The currently-airing block
carries a progress bar.

## Other surfaces (mock data — no live login)

| Component | File | Notes |
|---|---|---|
| `TitleGrid` | `src/components/TitleGrid.tsx` | auto-fill `270.4px`, gap `10px` |
| Browse | `src/app/browse/page.tsx` | genre pills `height: 48px` (`--dv-filter-button-height`) |
| Detail | `src/app/detail/[id]/page.tsx` | 576px billboard + metadata + "More like this" |
| Profiles | `src/app/profiles/page.tsx` | `150px` tiles, hover outline |
| My Stuff | `src/app/my-stuff/page.tsx` | click-driven tabs, `48px` tall |
