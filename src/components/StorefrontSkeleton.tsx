import { TopNav } from "@/components/TopNav";

/**
 * Loading placeholder shown while a route resolves.
 *
 * The target does a full document navigation between nav tabs — no crossfade,
 * no loader overlay. The page paints #00050d immediately and carousel rows
 * stream in progressively behind placeholders. This mirrors that: the nav is
 * present straight away, the content area shimmers until data arrives.
 */
export function StorefrontSkeleton({
  activeHref,
  hero = true,
  rows = 4,
}: {
  activeHref?: string;
  hero?: boolean;
  rows?: number;
}) {
  return (
    <div className="flex min-h-full flex-col bg-[var(--pv-base)]">
      <TopNav activeHref={activeHref} />

      <main className="flex-1">
        {hero ? (
          <div className="pv-skeleton mb-12 h-[576px] w-full" />
        ) : (
          <div className="h-[66px]" />
        )}

        {Array.from({ length: rows }, (_, i) => (
          <section key={i} className="mb-[42px]">
            <div className="mr-[72px] flex items-center">
              <span className="ml-4 flex items-center pb-[11px] md:ml-[72px]">
                <span className="pv-skeleton h-[28px] w-[160px] rounded" />
              </span>
            </div>
            <div className="flex gap-[10px] overflow-hidden px-4 md:px-[72px]">
              {Array.from({ length: 6 }, (_, j) => (
                <span
                  key={j}
                  className="pv-skeleton shrink-0 rounded-lg"
                  style={{ width: 270.4, height: 152.1 }}
                />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
