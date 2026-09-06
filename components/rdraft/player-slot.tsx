"use client";

import Image from "next/image";
import { Plus, X } from "lucide-react";

import { ddragon } from "@/lib/ddragon/urls";
import type { Player } from "@/lib/draft/types";
import type { Translation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const SLOT_SHAPE =
  "aspect-[1/2] w-[17vw] max-w-[170px] sm:w-[14vw] sm:max-w-[195px] rounded-lg overflow-hidden";

interface PlayerSlotProps {
  player: Player | null;
  /** The middle slot sits slightly forward, the way a lobby centres its host. */
  emphasised: boolean;
  version: string;
  onAdd: () => void;
  onRemove: () => void;
  t: Translation;
}

export function PlayerSlot({
  player,
  emphasised,
  version,
  onAdd,
  onRemove,
  t,
}: PlayerSlotProps) {
  if (!player) {
    return (
      <button
        type="button"
        onClick={onAdd}
        aria-label={t.addPlayer}
        className={cn(
          SLOT_SHAPE,
          "panel panel-interactive hatch group flex cursor-pointer flex-col items-center justify-center gap-2 transition-transform duration-300",
          emphasised ? "scale-[1.04]" : "hover:scale-[1.04]",
        )}
      >
        <Plus className="text-gold/35 group-hover:text-gold size-5 transition-colors sm:size-6" />
        <span className="text-micro text-gold/30 group-hover:text-gold/60 hidden px-2 text-center transition-colors sm:block">
          {t.addPlayer}
        </span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        SLOT_SHAPE,
        "panel group relative flex flex-col items-center justify-center gap-3 transition-transform duration-300",
        emphasised && "scale-[1.04]",
      )}
    >
      <div className="border-gold/40 relative size-10 overflow-hidden rounded-full border shadow-lg sm:size-20">
        {version && (
          <Image
            src={ddragon.profileIcon(version, player.iconId)}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        )}
      </div>

      <span className="text-micro sm:text-label max-w-[92%] truncate rounded-full border border-white/10 bg-black/55 px-2 py-0.5 text-center text-white sm:px-3">
        {player.name}
      </span>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`${t.clearAll} — ${player.name}`}
        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/55 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        <span className="bg-destructive/85 rounded-full p-2 shadow-lg">
          <X className="size-4 text-white sm:size-5" />
        </span>
      </button>
    </div>
  );
}
