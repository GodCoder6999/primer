import { notFound } from "next/navigation";
import { CarouselRow } from "@/components/CarouselRow";
import { SiteFooter } from "@/components/SiteFooter";
import { TopNav } from "@/components/TopNav";
import { genreRows, genreSlugs } from "@/lib/mock-data";

export function generateStaticParams() {
  return Object.keys(genreSlugs).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = genreSlugs[slug];
  return { title: name ? `Watch ${name} movies and TV shows on Prime Video` : "Prime Video" };
}

/** Genre landing page — h1 + carousel rows. The target renders no hero here. */
export default async function GenrePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = genreSlugs[slug];
  if (!name) notFound();

  return (
    <div className="flex min-h-full flex-col bg-[var(--pv-base)]">
      <TopNav />

      <main className="flex-1 pt-[calc(66px+32px)]">
        <h1 className="mb-6 px-4 text-[32px] font-bold leading-10 md:px-[72px]">{name}</h1>

        {genreRows.map((row) => (
          <CarouselRow key={row.id} row={row} />
        ))}

        <div className="h-10" />
      </main>

      <SiteFooter />
    </div>
  );
}
