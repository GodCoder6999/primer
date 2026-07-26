import Link from "next/link";
import { profiles } from "@/lib/mock-data";

export const metadata = { title: "Who's watching? — Prime Video" };

/** Profile switcher. Reconstructed from mock data — no live authentication. */
export default function ProfilesPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--pv-base)] px-4">
      <h1 className="mb-10 text-[40px] font-bold leading-[48px]">Who&apos;s watching?</h1>

      <ul className="flex flex-wrap items-start justify-center gap-8">
        {profiles.map((p) => (
          <li key={p.id}>
            <Link href="/" className="group flex w-[150px] flex-col items-center gap-3">
              <span
                className={`grid size-[150px] place-items-center rounded-lg text-[44px] font-bold transition-[outline-color,transform] duration-150 outline outline-2 outline-transparent group-hover:scale-105 group-hover:outline-white ${
                  p.isKids ? "bg-[#1a98ff]" : "bg-[#33373d]"
                }`}
              >
                {p.name.charAt(0)}
              </span>
              <span className="text-base text-[var(--pv-text-secondary)] transition-colors duration-150 group-hover:text-white">
                {p.name}
              </span>
            </Link>
          </li>
        ))}

        <li>
          <Link href="/profiles" className="group flex w-[150px] flex-col items-center gap-3">
            <span className="grid size-[150px] place-items-center rounded-lg border-2 border-dashed border-white/30 text-[44px] font-light text-white/50 transition-colors duration-150 group-hover:border-white group-hover:text-white">
              +
            </span>
            <span className="text-base text-[var(--pv-text-secondary)] transition-colors duration-150 group-hover:text-white">
              Add profile
            </span>
          </Link>
        </li>
      </ul>

      <Link
        href="/"
        className="mt-12 rounded-lg border border-white/40 px-6 py-3 text-base font-medium transition-colors duration-100 hover:bg-white/10"
      >
        Manage profiles
      </Link>
    </div>
  );
}
