"use client";

import Image from "next/image";

import { Spinner } from "@/components/ui/spinner";
import { ddragon } from "@/lib/ddragon/urls";
import type { DraftSlot } from "@/lib/draft/types";
import { cn } from "@/lib/utils";

interface ChampionSlotProps {
  slot: DraftSlot;
  version: string;
  revealed: boolean;
  selectable: boolean;
  selected: boolean;
  onSelect: () => void;
}

export function ChampionSlot({
  slot,
  version,
  revealed,
  selectable,
  selected,
  onSelect,
}: ChampionSlotProps) {
  const taken = slot.player !== null;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-micro text-gold/80 h-3 truncate">{slot.player?.name ?? ""}</span>

      <button
        type="button"
        disabled={!selectable}
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={slot.championName}
        className={cn(
          "relative size-16 shrink-0 overflow-hidden rounded-md bg-black/40 transition-all duration-200 sm:size-24",
          selectable && "hover:ring-gold/50 cursor-pointer hover:ring-2",
          selected && "ring-gold z-20 scale-110 shadow-[0_0_22px_-4px_rgba(200,156,56,0.7)] ring-2",
          !selectable && "cursor-default",
        )}
      >
        {revealed && version ? (
          <>
            <Image
              src={ddragon.championSquare(version, slot.imageFull)}
              alt=""
              fill
              sizes="96px"
              className={cn(
                "object-cover transition-all duration-500",
                taken ? "opacity-55 grayscale" : "opacity-100 grayscale-0",
              )}
            />

            {slot.lane && (
              <span className="text-micro bg-gold absolute inset-x-0 bottom-0 py-0.5 text-center text-stone-950">
                {slot.lane}
              </span>
            )}
          </>
        ) : (
          <span className="flex size-full items-center justify-center">
            <Spinner className="text-gold/50 size-5" />
          </span>
        )}
      </button>

      <p className="w-16 truncate text-center text-[11px] font-semibold text-stone-200 sm:w-24">
        {revealed ? slot.championName : "…"}
      </p>
    </div>
  );
}
