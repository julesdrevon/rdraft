"use client";

import { RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DraftState } from "@/lib/draft/reducer";
import { freeLanes, isSlotSelectable } from "@/lib/draft/reducer";
import type { Lane } from "@/lib/draft/types";
import type { Translation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { ChampionSlot } from "./champion-slot";
import { LaneSelector } from "./lane-selector";

interface StageDraftProps {
  state: DraftState;
  version: string;
  onSelectSlot: (index: number) => void;
  onAssignLane: (lane: Lane) => void;
  onRestart: () => void;
  onReset: () => void;
  t: Translation;
}

export function StageDraft({
  state,
  version,
  onSelectSlot,
  onAssignLane,
  onRestart,
  onReset,
  t,
}: StageDraftProps) {
  const drawing = state.phase === "drawing";
  const lanes = freeLanes(state.slots);
  const hasSelection = state.selectedSlot !== null;

  return (
    <section className="flex w-full flex-col items-center gap-6">
      <p className="text-micro text-stone-400">{drawing ? t.drawing : t.selectChampion}</p>

      {!drawing && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-micro text-gold animate-pulse">— {t.yourTurn} —</span>
          <p
            aria-live="polite"
            className={cn(
              "text-title text-center text-white uppercase transition-opacity duration-75",
              state.rouletteSettled ? "text-glow-gold opacity-100" : "opacity-60",
            )}
          >
            {state.rouletteName}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-center gap-3 sm:gap-4">
        {state.slots.map((slot, index) => (
          <ChampionSlot
            key={slot.uid}
            slot={slot}
            version={version}
            revealed={index < state.revealed}
            selectable={isSlotSelectable(state, index)}
            selected={state.selectedSlot === index}
            onSelect={() => onSelectSlot(index)}
          />
        ))}
      </div>

      {!drawing && (
        <LaneSelector
          lanes={lanes}
          disabled={!hasSelection || !state.rouletteSettled}
          onSelect={onAssignLane}
          t={t}
        />
      )}

      <div className="flex gap-3 pt-2">
        <Button
          onClick={onRestart}
          disabled={drawing}
          className="text-label bg-gold hover:bg-gold-bright cursor-pointer text-stone-950"
        >
          <RefreshCw className={cn("mr-2 size-4", drawing && "animate-spin")} />
          {t.restart}
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          className="text-label border-destructive/50 text-destructive hover:bg-destructive/10 cursor-pointer"
        >
          <Trash2 className="mr-2 size-4" />
          {t.clearAll}
        </Button>
      </div>
    </section>
  );
}
