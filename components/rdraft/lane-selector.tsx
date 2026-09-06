"use client";

import type { Lane } from "@/lib/draft/types";
import type { Translation } from "@/lib/i18n";

import { LaneIcon } from "./lane-icon";

interface LaneSelectorProps {
  lanes: Lane[];
  disabled?: boolean;
  onSelect: (lane: Lane) => void;
  t: Translation;
}

export function LaneSelector({ lanes, disabled, onSelect, t }: LaneSelectorProps) {
  if (lanes.length === 0) return null;

  return (
    <div className="flex w-full flex-col items-center gap-4 border-t border-white/5 pt-6">
      <p className="text-micro text-stone-500">{t.assignToLane}</p>

      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        {lanes.map((lane) => (
          <button
            key={lane}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(lane)}
            className="group text-gold/55 hover:text-gold flex cursor-pointer flex-col items-center gap-1.5 transition-colors disabled:cursor-default disabled:opacity-40"
          >
            <span className="border-gold/20 group-hover:border-gold/60 group-hover:bg-gold/10 flex size-12 items-center justify-center rounded-full border bg-black/40 transition-all duration-200 group-hover:scale-110 group-enabled:group-hover:shadow-[0_0_20px_-4px_rgba(200,156,56,0.6)]">
              <LaneIcon lane={lane} className="size-6" />
            </span>
            <span className="text-micro opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              {lane}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
