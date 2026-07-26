import { TitleCard } from "./TitleCard";
import type { Title } from "@/types/catalog";

/**
 * Browse / category grid. Uses the target's 12-column page grid
 * (--dv-page-margin 72px, --dv-page-column-gap 24px) collapsed to a responsive
 * auto-fill of 270.4px cards.
 */
export function TitleGrid({ titles }: { titles: Title[] }) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(270.4px,1fr))] gap-x-[10px] gap-y-8 px-4 md:px-[72px]">
      {titles.map((title) => (
        <li key={title.id} className="justify-self-start">
          <TitleCard title={title} />
        </li>
      ))}
    </ul>
  );
}
