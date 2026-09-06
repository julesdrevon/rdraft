"use client";

import * as React from "react";
import Image from "next/image";
import { Fingerprint, Volume2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { audio } from "@/lib/audio/manager";
import { ddragon, type VoiceLine } from "@/lib/ddragon/urls";
import type { Champion } from "@/lib/draft/types";
import type { Translation } from "@/lib/i18n";
import { sample } from "@/lib/random";
import { cn } from "@/lib/utils";

interface SecretGameProps {
  pool: Champion[];
  version: string;
  voiceLocale: string;
  t: Translation;
}

interface Round {
  champion: Champion;
  line: VoiceLine;
}

/** Guess the champion from a pick or ban line. Hidden behind the fingerprint. */
export function SecretGame({ pool, version, voiceLocale, t }: SecretGameProps) {
  const [round, setRound] = React.useState<Round | null>(null);
  const [revealed, setRevealed] = React.useState(false);

  const startRound = () => {
    const champion = sample(pool);
    if (!champion) return;

    const line: VoiceLine = Math.random() > 0.5 ? "choose" : "ban";
    setRound({ champion, line });
    setRevealed(false);
    audio.preloadVoice(champion.key, voiceLocale, line);
    window.setTimeout(() => audio.playVoice(champion.key, voiceLocale, line), 100);
  };

  const close = () => {
    setRound(null);
    setRevealed(false);
  };

  return (
    <div className="fixed right-4 bottom-4 z-100 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {round && (
        <div className="panel animate-in fade-in slide-in-from-bottom-4 relative w-60 rounded-xl p-4 duration-300">
          <button
            type="button"
            onClick={close}
            aria-label={t.cancel}
            className="absolute -top-2 -right-2 flex size-6 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-stone-800 text-white/60 transition-colors hover:text-white"
          >
            <X className="size-3" />
          </button>

          <div className="flex flex-col items-center gap-4">
            <p className="text-micro text-gold">{t.guessWho}</p>

            <div className="relative size-24 overflow-hidden rounded-lg border border-white/5 bg-black/50">
              {revealed && version ? (
                <Image
                  src={ddragon.championSquare(version, round.champion.image.full)}
                  alt=""
                  fill
                  sizes="96px"
                  className="animate-in zoom-in-50 object-cover duration-500"
                />
              ) : (
                <span className="flex size-full items-center justify-center text-4xl font-black text-white/10">
                  ?
                </span>
              )}
            </div>

            {revealed && (
              <p className="text-label animate-in fade-in text-center text-white">
                {round.champion.name}
              </p>
            )}

            <div className="flex w-full flex-col gap-2">
              <div className="flex w-full gap-2">
                {revealed ? (
                  <Button
                    onClick={startRound}
                    className="bg-gold hover:bg-gold-bright h-8 flex-1 cursor-pointer text-xs text-stone-950"
                  >
                    {t.replay}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setRevealed(true)}
                    className="bg-gold hover:bg-gold-bright h-8 flex-1 cursor-pointer text-xs text-stone-950"
                  >
                    {t.reveal}
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => audio.playVoice(round.champion.key, voiceLocale, round.line)}
                  aria-label={t.playVoice}
                  className="h-8 w-10 cursor-pointer border-white/10 hover:bg-white/5"
                >
                  <Volume2 className="size-4" />
                </Button>
              </div>

              <p className="text-center text-[9px] leading-tight text-white/30">{t.audioNotice}</p>
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={round ? close : startRound}
        disabled={pool.length === 0}
        title={t.secretGame}
        aria-label={t.secretGame}
        className={cn(
          "size-12 cursor-pointer rounded-full p-0 shadow-2xl transition-all duration-300",
          round
            ? "bg-destructive/90 hover:bg-destructive"
            : "bg-gold hover:bg-gold-bright hover:scale-110",
        )}
      >
        {round ? (
          <X className="size-5 text-white" />
        ) : (
          <Fingerprint className="size-5 text-stone-950" />
        )}
      </Button>
    </div>
  );
}
