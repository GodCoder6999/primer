import type {
  CarouselRowData,
  Episode,
  HeroSlide,
  NavItem,
  Profile,
  Title,
  TitleDetail,
} from "@/types/catalog";
import catalog from "./tmdb-catalog.json";

/**
 * Catalogue for the clone.
 *
 * Artwork and titles come from TMDB — regenerate with `node scripts/fetch-tmdb.mjs`
 * (needs TMDB_API_KEY in .env.local). TMDB gives us both aspect ratios the
 * target uses: `backdrop_path` for 16:9 cards and heroes, `poster_path` for the
 * 2:3 portrait rows.
 *
 * Everything else here — nav structure, profiles, live schedule, detail-page
 * credits — is mock data written for this clone.
 */

export const rows = catalog.rows as unknown as CarouselRowData[];
export const heroSlides = catalog.heroSlides as unknown as HeroSlide[];

export interface CategoryTile {
  label: string;
  href: string;
  image: string;
}

export const genreTiles = catalog.genreTiles as CategoryTile[];
export const featuredCollectionTiles = catalog.featuredCollectionTiles as CategoryTile[];

/** Index rows by id so the per-surface row sets can be assembled by name. */
const byId = new Map(rows.map((r) => [r.id, r]));
const row = (id: string): CarouselRowData => byId.get(id) ?? rows[0];

/** Re-label a source row for a different surface. */
const pick = (from: CarouselRowData, heading: string, id: string): CarouselRowData => ({
  ...from,
  id,
  heading,
  seeMoreHref: "/browse",
});

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Free to me", href: "/collection/streamfree" },
  { label: "Movies", href: "/movie" },
  { label: "TV shows", href: "/tv" },
  { label: "Live TV", href: "/livetv" },
  { label: "Subscriptions", href: "/addons" },
];

export const categoryColumns: NavItem[][] = [
  [
    { label: "Action and adventure", href: "/genre/action" },
    { label: "Anime", href: "/genre/anime" },
    { label: "Comedy", href: "/genre/comedy" },
    { label: "Documentary", href: "/genre/documentary" },
    { label: "Drama", href: "/genre/drama" },
    { label: "Fantasy", href: "/genre/fantasy" },
    { label: "Horror", href: "/genre/horror" },
    { label: "Kids", href: "/kids" },
  ],
  [
    { label: "Mystery and thrillers", href: "/genre/suspense" },
    { label: "Romance", href: "/genre/romance" },
    { label: "Science fiction", href: "/genre/science-fiction" },
  ],
  [
    { label: "Home Premiere", href: "/collection/HCE_IN" },
    { label: "New Releases", href: "/collection/in_new_releases" },
    { label: "MX Player", href: "/collection/miniTV_Merch1" },
    { label: "Critically acclaimed", href: "/collection/INAwardsandNominations" },
    { label: "Kids", href: "/kids" },
  ],
];

export const profiles: Profile[] = [
  { id: "p1", name: "Anirban", avatar: "/images/brand/prime-video-logo.png" },
  { id: "p2", name: "Guest", avatar: "/images/brand/prime-video-logo.png" },
  { id: "p3", name: "Kids", avatar: "/images/brand/prime-video-logo.png", isKids: true },
];

/* ───────────────────────────────────────────── per-surface row sets */

export const movieRows: CarouselRowData[] = [
  pick(row("top-movies"), "Top movies", "m1"),
  pick(row("drama-movies"), "Drama movies", "m2"),
  pick(row("action"), "Action and adventure movies", "m3"),
  pick(row("comedy"), "Comedy movies", "m4"),
  pick(row("kids"), "Kids and family movies", "m5"),
  { ...row("featured"), id: "m6", heading: "Featured Originals: Movies", variant: "portrait", seeMoreHref: undefined },
];

export const tvRows: CarouselRowData[] = [
  { ...row("top10"), id: "tv0", heading: "Top 10 TV shows in India", variant: "top10", seeMoreHref: undefined },
  pick(row("top-tv"), "Top TV", "tv1"),
  pick(row("drama-tv"), "Drama TV", "tv2"),
  pick(row("recent-tv"), "Recently added TV", "tv3"),
  pick(row("scifi"), "Sci-fi and fantasy TV", "tv4"),
  pick(row("docs"), "Unscripted TV", "tv5"),
];

export const freeRows: CarouselRowData[] = [
  { ...row("top10"), id: "f0", heading: "Top 10: Watch for Free", variant: "top10", seeMoreHref: undefined },
  pick(row("top-movies"), "Trending Movies: Watch for Free", "f1"),
  { ...row("featured"), id: "f2", heading: "Featured Originals with first episode free", variant: "portrait", seeMoreHref: undefined },
  pick(row("recent-tv"), "Recently added: Watch for Free", "f3"),
  pick(row("action"), "Popular Action Movies", "f4"),
  pick(row("comedy"), "Comedy spotlight", "f5"),
  pick(row("horror"), "Horror Shows", "f6"),
  pick(row("kids"), "Binge with family", "f7"),
  pick(row("romance"), "Romance Redefined", "f8"),
  pick(row("docs"), "Award winning documentaries", "f9"),
];

export const subscriptionRows: CarouselRowData[] = [
  pick(row("drama-tv"), "Subscriptions you might like", "s1"),
  { ...row("top10"), id: "s2", heading: "Top 10 with subscriptions", variant: "top10", seeMoreHref: undefined },
  pick(row("top-movies"), "First Episode Free: with Add-On Subscriptions", "s3"),
  pick(row("scifi"), "Channel K: Recently added", "s4"),
  pick(row("horror"), "hoichoi: Recently added", "s5"),
];

export const genreSlugs: Record<string, string> = {
  action: "Action and adventure",
  anime: "Anime",
  comedy: "Comedy",
  documentary: "Documentary",
  drama: "Drama",
  fantasy: "Fantasy",
  horror: "Horror",
  suspense: "Mystery and thrillers",
  romance: "Romance",
  "science-fiction": "Science fiction",
};

export const genreRows: CarouselRowData[] = [
  pick(row("top-movies"), "Movies", "g1"),
  pick(row("top-tv"), "TV shows", "g2"),
  pick(row("drama-movies"), "Shop: Movies to rent", "g3"),
  pick(row("action"), "Popular movies", "g4"),
  pick(row("drama-tv"), "Popular TV", "g5"),
  pick(row("comedy"), "Shop: Popular movies with subscriptions", "g6"),
  pick(row("recent-tv"), "Shop: Popular TV with subscriptions", "g7"),
];

export const kidsRows: CarouselRowData[] = [
  pick(row("kids"), "Kids and family movies", "k1"),
  pick(row("comedy"), "Kids and family TV", "k2"),
  { ...row("featured"), id: "k3", heading: "Featured Originals for kids", variant: "portrait", seeMoreHref: undefined },
  pick(row("action"), "Action and adventure TV and movies", "k4"),
  pick(row("scifi"), "Animated adventures", "k5"),
];

export const collectionSlugs: Record<string, string> = {
  HCE_IN: "Home Premiere",
  in_new_releases: "New Releases",
  miniTV_Merch1: "MX Player",
  INAwardsandNominations: "Critically acclaimed",
};

export const collectionRows: CarouselRowData[] = [
  pick(row("featured"), "Featured", "cl1"),
  pick(row("top-movies"), "Popular", "cl2"),
  pick(row("recent-tv"), "Recently added", "cl3"),
];

/* ─────────────────────────────────────────────────── live schedule */

export interface LiveProgram {
  title: string;
  /** Slot width in 30-minute units. */
  slots: number;
  /** Percentage watched, only on the currently-airing programme. */
  progress?: number;
}

export interface LiveChannel {
  id: string;
  name: string;
  logo: string;
  programs: LiveProgram[];
}

const liveArt = (i: number) => row("top10").titles[i % row("top10").titles.length].cardImage;

export const liveChannels: LiveChannel[] = [
  {
    id: "c1",
    name: "BBC Kids",
    logo: liveArt(1),
    programs: [
      { title: "Morning Cartoons", slots: 2, progress: 57 },
      { title: "Story Time", slots: 1 },
      { title: "Nature for Kids", slots: 2 },
      { title: "Puzzle Hour", slots: 2 },
    ],
  },
  {
    id: "c2",
    name: "BBC Player",
    logo: liveArt(3),
    programs: [
      { title: "World News", slots: 1, progress: 30 },
      { title: "Documentary Feature", slots: 3 },
      { title: "Evening Drama", slots: 2 },
    ],
  },
  {
    id: "c3",
    name: "FanCode",
    logo: liveArt(5),
    programs: [
      { title: "Live Cricket: Match Centre", slots: 4, progress: 72 },
      { title: "Post-match Analysis", slots: 1 },
      { title: "Highlights", slots: 2 },
    ],
  },
  {
    id: "c4",
    name: "ManoramaMAX",
    logo: liveArt(7),
    programs: [
      { title: "Regional Headlines", slots: 1, progress: 12 },
      { title: "Afternoon Movie", slots: 4 },
      { title: "Talk Show", slots: 2 },
    ],
  },
  {
    id: "c5",
    name: "NBA League Pass",
    logo: liveArt(9),
    programs: [
      { title: "Classic Games", slots: 2, progress: 44 },
      { title: "Live: Season Game", slots: 3 },
      { title: "Courtside Recap", slots: 2 },
    ],
  },
];

/* ──────────────────────────────────────────── detail page metadata */

/** Per-title credits and episodes, keyed by title id (from TMDB). */
type TmdbDetail = Partial<TitleDetail> & { genres?: string[]; runtime?: string };
const detailsById = catalog.details as unknown as Record<string, TmdbDetail>;

/** Fields the API doesn't supply — shared across titles. */
const STATIC_DETAIL = {
  rank: "#9 in India",
  qualityBadges: ["HDR", "UHD"],
  contentAdvisory: [
    "smoking depictions",
    "violence",
    "foul language",
    "alcohol use",
    "flashing lights may affect photosensitive viewers",
  ],
  audioLanguages: ["English", "Hindi", "Hindi [Audio Description]", "Tamil", "Telugu"],
  subtitles: [
    "English",
    "Hindi [CC]",
    "Kannada",
    "Malayalam",
    "Tamil",
    "Telugu",
    "Indonesia",
    "Melayu",
    "Türkçe",
  ],
} satisfies Partial<TitleDetail>;

/**
 * Detail metadata for one title: real credits and episodes from TMDB, merged
 * with the static advisory/audio/subtitle blocks. Movies come back with an
 * empty `episodes` array, which the detail page uses to drop the tab.
 *
 * Resolved via the title's TMDB id, not its local row id — the same title
 * appears across several rows under different local ids.
 */
export function getTitleDetail(id: string): TitleDetail & { episodes: Episode[] } {
  const t = findTitle(id);
  const key = t ? `${t.isSeries ? "tv" : "movie"}:${t.tmdbId}` : "";
  const d = detailsById[key] ?? {};
  return {
    ...STATIC_DETAIL,
    seasonLabel: d.seasonLabel,
    directors: d.directors?.length ? d.directors : ["—"],
    producers: d.producers?.length ? d.producers : ["—"],
    cast: d.cast?.length ? d.cast : ["—"],
    studio: d.studio ?? "—",
    episodes: d.episodes ?? [],
  };
}

/** Flat catalogue for the browse grid and detail lookups. */
export const allTitles: Title[] = rows.flatMap((r) => r.titles);

export function findTitle(id: string): Title | undefined {
  return allTitles.find((t) => t.id === id) ?? heroSlides.find((h) => h.title.id === id)?.title;
}
