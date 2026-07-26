import Image from "next/image";
import Link from "next/link";
import type { CategoryTile } from "@/lib/mock-data";

/**
 * Category tile grid (/categories).
 *
 * Measured on the target: 5 columns of 248.15px, 10px gap, each tile 139.587px
 * tall wrapping 16:9 art with a 20px/700 label drawn over it.
 */
export function CategoryTileGrid({ tiles }: { tiles: CategoryTile[] }) {
  return (
    <ul className="grid grid-cols-2 gap-[10px] px-4 sm:grid-cols-3 lg:grid-cols-5 md:px-[72px]">
      {tiles.map((tile) => (
        <li key={`${tile.href}-${tile.label}`}>
          <Link
            href={tile.href}
            aria-label={tile.label}
            className="group relative block aspect-video overflow-hidden rounded-lg"
          >
            <Image
              src={tile.image}
              alt=""
              fill
              sizes="248px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Scrim keeps the label legible over any artwork. */}
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgb(0_5_13_/_0.85)] via-[rgb(0_5_13_/_0.25)] to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-3 text-xl font-bold leading-7 text-white">
              {tile.label}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
