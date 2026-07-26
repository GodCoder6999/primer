/** Content structures observed on the target's storefront.
 *  All data in this clone is mock data — there is no backend. */

/** Small white pill rendered on the top-right of a card. */
export type CardBadge =
  | "NEW SERIES"
  | "NEW EPISODE"
  | "NEW MOVIE"
  | "NEW SEASON"
  | "TOP 10"
  | "MOST LIKED"
  | "MOST REWATCHED"
  | "TRENDING";

/** Entitlement chip shown over the artwork. */
export type Entitlement = "prime" | "subscription" | "rent-buy" | "free-with-ads";

export type MaturityRating = "U" | "U/A 7+" | "U/A 13+" | "U/A 16+" | "A";

export interface Title {
  id: string;
  /** Upstream TMDB id — the key for looking up credits and episodes. */
  tmdbId?: number;
  name: string;
  /** 16:9 card artwork (TMDB `backdrop_path`). */
  cardImage: string;
  /** True 2:3 poster (TMDB `poster_path`), used by the portrait rows. */
  posterImage?: string | null;
  /** Wide 21:9 hero art, only present for billboard titles. */
  heroImage?: string;
  /** Title treatment / logo art rendered over the hero. */
  logoImage?: string;
  synopsis: string;
  badge?: CardBadge;
  entitlement: Entitlement;
  maturityRating?: MaturityRating;
  year?: number;
  /** e.g. "Season 1" — shown before the synopsis in the hover panel. */
  seasonLabel?: string;
  runtime?: string;
  languages?: string[];
  genres?: string[];
  isSeries?: boolean;
  imdbRating?: number;
}

/** One horizontally-scrolling carousel row. */
export interface CarouselRowData {
  id: string;
  heading: string;
  titles: Title[];
  /** Card geometry for the row.
   *  - `standard` 16:9
   *  - `top10`    16:9 preceded by an oversized rank numeral
   *  - `portrait` 2:3 poster over a bleeding 16:9 backdrop */
  variant?: "standard" | "top10" | "portrait";
  /** Adds the "See more >" affordance next to the heading. */
  seeMoreHref?: string;
}

/** One slide of the hero billboard. */
export interface HeroSlide {
  id: string;
  title: Title;
  /** Pipe-joined language list under the logo, e.g. "Korean | Hindi | Tamil". */
  languageLine?: string;
  primaryCta: { label: string; href: string };
  /** Small line under the CTAs, e.g. "Watch with a Prime membership". */
  entitlementNote?: string;
}

export interface NavItem {
  label: string;
  href: string;
  /** Renders the flyout panel instead of navigating. */
  children?: NavItem[];
}

/** One episode row in a season's grid on the detail page. */
export interface Episode {
  number: number;
  name: string;
  synopsis: string;
  runtime: string;
  releaseDate: string;
  thumbnail: string;
}

/** Credits + technical metadata shown in the detail page's info panels. */
export interface TitleDetail {
  contentAdvisory: string[];
  audioLanguages: string[];
  subtitles: string[];
  directors: string[];
  producers: string[];
  cast: string[];
  studio: string;
  qualityBadges: string[];
  episodes?: Episode[];
  seasonLabel?: string;
  rank?: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  isKids?: boolean;
}
