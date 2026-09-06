"use client";

import { RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LANES, type DraftSlot } from "@/lib/draft/types";
import type { Translation } from "@/lib/i18n";

import { ResultCard } from "./result-card";

interface StageResultsProps {
  slots: DraftSlot[];
  rerolling: string[];
  version: string;
  onReroll: (index: number) => void;
  onRerollSettled: (uid: string) => void;
  onRestart: () => void;
  onReset: () => void;
  t: Translation;
}

export function StageResults({
  slots,
  rerolling,
  version,
  onReroll,
  onRerollSettled,
  onRestart,
  onReset,
  t,
}: StageResultsProps) {
  /* Read the team left to right the way the game does: top through support. */
  const ordered = [...slots].sort(
    (a, b) => LANES.indexOf(a.lane ?? "TOP") - LANES.indexOf(b.lane ?? "TOP"),
  );

  return (
    <section className="flex w-full flex-col items-center gap-6 sm:gap-8">
      <h2 className="text-title text-glow-gold text-center text-white uppercase">
        {t.luckFinal}
      </h2>

      {/*
        One column per champion, each an equal fraction of the row, so the team
        never wraps. The row is capped at what the cards actually need: without
        it a three-player draft would be strung across the whole page.
      */}
      <div
        className="mx-auto grid w-full auto-cols-fr grid-flow-col items-center gap-[var(--gap)] [--card-max:150px] [--gap:0.375rem] sm:[--card-max:230px] sm:[--gap:1rem]"
        style={{
          maxWidth: `calc(${ordered.length} * var(--card-max) + ${ordered.length - 1} * var(--gap))`,
        }}
      >
        {ordered.map((slot) => (
          <ResultCard
            key={slot.uid}
            slot={slot}
            version={version}
            rerolling={rerolling.includes(slot.uid)}
            onReroll={() => onReroll(slots.findIndex((candidate) => candidate.uid === slot.uid))}
            onRerollSettled={onRerollSettled}
            t={t}
          />
        ))}
      </div>

      <p className="text-micro text-gold/70">{t.rerollHint}</p>

      <div className="flex gap-3 sm:gap-4">
        <Button
          onClick={onRestart}
          size="lg"
          className="text-label bg-gold hover:bg-gold-bright cursor-pointer px-8 text-stone-950 shadow-[0_0_28px_-8px_rgba(200,156,56,0.8)]"
        >
          <RefreshCw className="mr-2 size-4" />
          {t.replay}
        </Button>
        <Button
          onClick={onReset}
          size="lg"
          variant="outline"
          className="text-label border-destructive/50 text-destructive hover:bg-destructive hover:text-white cursor-pointer px-6"
        >
          <Trash2 className="mr-2 size-4" />
          {t.quit}
        </Button>
      </div>
    </section>
  );
}
