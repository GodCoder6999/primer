"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { LiveChannel } from "@/lib/mock-data";

/** One 30-minute slot's width, in px. */
const SLOT_W = 253.2;
/** Channel logo column width, measured on the target. */
const LOGO_W = 132;

/** Half-hour labels across the schedule header. */
function slotLabels(count: number): string[] {
  const out: string[] = [];
  const start = new Date();
  start.setMinutes(start.getMinutes() < 30 ? 0 : 30, 0, 0);
  for (let i = 0; i < count; i += 1) {
    const d = new Date(start.getTime() + i * 30 * 60_000);
    out.push(
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
    );
  }
  return out;
}

/**
 * Live TV schedule (EPG) row.
 *
 * The target lays each channel out as a grid: a logo column, then a strip of
 * programme blocks 148px tall, under a 48px header of half-hour labels.
 */
export function LiveScheduleGrid({ channels }: { channels: LiveChannel[] }) {
  const labels = slotLabels(8);

  return (
    <div className="px-4 md:px-[72px]">
      {/* Time header — 48px tall, "On now" pinned above the logo column. */}
      <div className="flex items-center" style={{ height: 48 }}>
        <div className="shrink-0 text-base font-bold" style={{ width: LOGO_W }}>
          On now
        </div>
        <div className="pv-scrollbar-none flex overflow-hidden">
          {labels.map((l) => (
            <div
              key={l}
              className="shrink-0 text-base text-[var(--pv-text-secondary)]"
              style={{ width: SLOT_W }}
            >
              {l}
            </div>
          ))}
        </div>
      </div>

      <ul>
        {channels.map((channel) => (
          <li key={channel.id} className="mb-3">
            <h2 className="mb-2 text-xl font-bold leading-7">{channel.name}</h2>

            <div className="flex items-stretch gap-3">
              {/* Channel logo column */}
              <div
                className="relative shrink-0 overflow-hidden rounded-lg bg-[var(--pv-card-placeholder)]"
                style={{ width: LOGO_W, height: 148 }}
              >
                <Image src={channel.logo} alt={channel.name} fill sizes="132px" className="object-cover" />
              </div>

              {/* Programme strip */}
              <div className="pv-scrollbar-none flex gap-3 overflow-x-auto" style={{ height: 148 }}>
                {channel.programs.map((program, i) => (
                  <article
                    key={`${channel.id}-${i}`}
                    className={cn(
                      "relative flex shrink-0 flex-col justify-end overflow-hidden rounded-lg p-3",
                      "bg-[#252e39] transition-colors duration-150 hover:bg-[#33373d]",
                    )}
                    style={{ width: program.slots * SLOT_W - 12 }}
                  >
                    <p className="truncate text-base font-medium">{program.title}</p>
                    {program.progress !== undefined ? (
                      <>
                        <p className="mt-1 text-[13px] text-[var(--pv-text-secondary)]">
                          Currently airing
                        </p>
                        <div className="mt-2 h-[3px] w-full rounded-full bg-white/25">
                          <div
                            className="h-full rounded-full bg-[var(--pv-blue)]"
                            style={{ width: `${program.progress}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <p className="mt-1 text-[13px] text-[var(--pv-text-secondary)]">Up next</p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
