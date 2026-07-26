import { TopNav } from "@/components/TopNav";

export default function Loading() {
  return (
    <div className="flex min-h-full flex-col bg-[var(--pv-base)]">
      <TopNav activeHref="/browse" />
      <main className="flex-1 pt-[calc(66px+32px)]">
        <div className="pv-skeleton mb-6 ml-4 h-10 w-[160px] rounded md:ml-[72px]" />
        {/* genre filter pills — 48px tall on the target */}
        <div className="mb-10 flex flex-wrap gap-3 px-4 md:px-[72px]">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className="pv-skeleton h-12 w-[140px] rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(270.4px,1fr))] gap-x-[10px] gap-y-8 px-4 md:px-[72px]">
          {Array.from({ length: 18 }, (_, i) => (
            <span
              key={i}
              className="pv-skeleton rounded-lg"
              style={{ width: 270.4, height: 152.1 }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
