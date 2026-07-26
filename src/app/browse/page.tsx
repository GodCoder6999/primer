import { SiteFooter } from "@/components/SiteFooter";
import { TitleGrid } from "@/components/TitleGrid";
import { TopNav } from "@/components/TopNav";
import { allTitles, categoryColumns } from "@/lib/mock-data";
import Link from "next/link";

export const metadata = { title: "Browse — Prime Video" };

export default function BrowsePage() {
  const genres = categoryColumns.flat();

  return (
    <div className="flex min-h-full flex-col bg-[var(--pv-base)]">
      <TopNav activeHref="/browse" />

      <main className="flex-1 pt-[calc(66px+32px)]">
        <h1 className="mb-6 px-4 text-[32px] font-bold leading-[40px] md:px-[72px]">Browse</h1>

        {/* Genre filter pills — 48px tall, matching --dv-filter-button-height. */}
        <ul className="mb-10 flex flex-wrap gap-3 px-4 md:px-[72px]">
          {genres.map((g) => (
            <li key={`${g.href}-${g.label}`}>
              <Link
                href={g.href}
                className="flex h-12 items-center rounded-lg bg-[#252e39] px-[14px] text-base font-medium tracking-[0.64px] transition-colors duration-100 hover:bg-[#33373d]"
              >
                {g.label}
              </Link>
            </li>
          ))}
        </ul>

        <TitleGrid titles={allTitles} />
      </main>

      <SiteFooter />
    </div>
  );
}
