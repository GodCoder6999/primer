import { notFound } from "next/navigation";
import { CarouselRow } from "@/components/CarouselRow";
import { SiteFooter } from "@/components/SiteFooter";
import { TopNav } from "@/components/TopNav";
import { collectionRows, collectionSlugs } from "@/lib/mock-data";

export function generateStaticParams() {
  return Object.keys(collectionSlugs).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = collectionSlugs[slug];
  return { title: name ? `${name} — Prime Video` : "Prime Video" };
}

/** Featured collection landing page — h1 + carousel rows, no hero. */
export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = collectionSlugs[slug];
  if (!name) notFound();

  return (
    <div className="flex min-h-full flex-col bg-[var(--pv-base)]">
      <TopNav />

      <main className="flex-1 pt-[calc(66px+32px)]">
        <h1 className="mb-6 px-4 text-[32px] font-bold leading-10 md:px-[72px]">{name}</h1>

        {collectionRows.map((row) => (
          <CarouselRow key={row.id} row={row} />
        ))}

        <div className="h-10" />
      </main>

      <SiteFooter />
    </div>
  );
}
