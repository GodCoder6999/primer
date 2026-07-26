import { CategoryTileGrid } from "@/components/CategoryTileGrid";
import { SiteFooter } from "@/components/SiteFooter";
import { TopNav } from "@/components/TopNav";
import { featuredCollectionTiles, genreTiles } from "@/lib/mock-data";

export const metadata = { title: "Prime Video: Categories" };

/** /categories has no hero and no carousels — just titled tile grids. */
export default function CategoriesPage() {
  return (
    <div className="flex min-h-full flex-col bg-[var(--pv-base)]">
      <TopNav activeHref="/categories" />

      <main className="flex-1 pt-[calc(66px+32px)]">
        <h1 className="mb-8 px-4 text-[32px] font-bold leading-10 md:px-[72px]">Categories</h1>

        <section className="mb-10">
          <h2 className="mb-4 px-4 text-xl font-bold leading-7 md:px-[72px]">Genres</h2>
          <CategoryTileGrid tiles={genreTiles} />
        </section>

        <section className="mb-16">
          <h2 className="mb-4 px-4 text-xl font-bold leading-7 md:px-[72px]">
            Featured collections
          </h2>
          <CategoryTileGrid tiles={featuredCollectionTiles} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
