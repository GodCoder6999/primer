import { TopNav } from "@/components/TopNav";

/** /categories has no hero and no carousels — just tile grids. */
export default function Loading() {
  return (
    <div className="flex min-h-full flex-col bg-[var(--pv-base)]">
      <TopNav activeHref="/categories" />
      <main className="flex-1 pt-[calc(66px+32px)]">
        <div className="pv-skeleton mb-8 ml-4 h-10 w-[220px] rounded md:ml-[72px]" />
        {[11, 5].map((count, s) => (
          <section key={s} className="mb-10">
            <div className="pv-skeleton mb-4 ml-4 h-7 w-[180px] rounded md:ml-[72px]" />
            <div className="grid grid-cols-2 gap-[10px] px-4 sm:grid-cols-3 lg:grid-cols-5 md:px-[72px]">
              {Array.from({ length: count }, (_, i) => (
                <span key={i} className="pv-skeleton aspect-video rounded-lg" />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
