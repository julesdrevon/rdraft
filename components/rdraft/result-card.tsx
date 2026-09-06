"use client";

import * as React from "react";
import Image from "next/image";
import { RefreshCw } from "lucide-react";

import { ddragon } from "@/lib/ddragon/urls";
import type { DraftSlot } from "@/lib/draft/types";
import type { Translation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { LaneIcon } from "./lane-icon";

/** Hold the swap animation this long even if the new art arrives sooner. */
const MIN_REROLL_MS = 500;

interface ResultCardProps {
  slot: DraftSlot;
  version: string;
  rerolling: boolean;
  onReroll: () => void;
  onRerollSettled: (uid: string) => void;
  t: Translation;
}

export function ResultCard({
  slot,
  version,
  rerolling,
  onReroll,
  onRerollSettled,
  t,
}: ResultCardProps) {
  const startedAt = React.useRef(0);
  const timer = React.useRef<number>(0);

  React.useEffect(() => {
    if (rerolling) startedAt.current = Date.now();
  }, [rerolling]);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleArtLoaded = () => {
    if (!rerolling) return;
    const remaining = Math.max(0, MIN_REROLL_MS - (Date.now() - startedAt.current));
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onRerollSettled(slot.uid), remaining);
  };

  return (
    <button
      type="button"
      onClick={onReroll}
      title={t.rerollHint}
      aria-label={`${t.reroll} — ${slot.championName}`}
      className="group border-gold/15 hover:border-gold/45 relative aspect-[308/560] w-full cursor-pointer overflow-hidden rounded-lg border shadow-2xl transition-colors"
    >
      <Image
        src={ddragon.championLoading(slot.championId)}
        alt=""
        fill
        sizes="(max-width: 640px) 20vw, 230px"
        className={cn(
          "object-cover transition-all duration-500",
          rerolling
            ? "scale-110 opacity-0 blur-sm"
            : "scale-100 opacity-85 blur-0 group-hover:opacity-100",
        )}
        onLoad={handleArtLoaded}
      />

      <span className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent opacity-70 transition-opacity group-hover:opacity-50" />

      {rerolling && (
        <span className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 backdrop-blur-sm">
          <RefreshCw className="text-gold size-10 animate-spin" />
        </span>
      )}

      <span className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
        <RefreshCw className="size-10 text-white/90 drop-shadow-lg sm:size-14" />
      </span>

      {/* Player identity sits at the optical centre of the art. */}
      <span className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-1.5 sm:gap-2.5">
        <span className="border-gold/30 relative size-8 overflow-hidden rounded-full border bg-black/50 shadow-2xl sm:size-16">
          {version && slot.player && (
            <Image
              src={ddragon.profileIcon(version, slot.player.iconId)}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          )}
        </span>

        <span className="text-micro sm:text-label max-w-[90%] truncate rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-white sm:px-3 sm:py-1">
          {slot.player?.name}
        </span>
      </span>

      <span className="absolute inset-x-0 bottom-2 z-10 flex flex-col items-center gap-1 px-1 sm:bottom-5 sm:gap-2">
        {slot.lane && (
          <span className="border-gold/25 group-hover:border-gold/60 text-gold flex size-6 items-center justify-center rounded-full border bg-black/60 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 sm:size-11">
            <LaneIcon lane={slot.lane} className="size-3.5 sm:size-6" />
          </span>
        )}

        <span className="w-full truncate text-center font-serif text-[9px] text-white italic opacity-85 group-hover:opacity-100 sm:text-base">
          {slot.championName}
        </span>
      </span>
    </button>
  );
}
