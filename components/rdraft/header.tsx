"use client";

import type { LangCode, Translation } from "@/lib/i18n";

import { LanguageMenu } from "./language-menu";
import { VolumeControl } from "./volume-control";

interface HeaderProps {
  lang: LangCode;
  onLangChange: (lang: LangCode) => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  onReset: () => void;
  showTagline: boolean;
  t: Translation;
}

export function Header({
  lang,
  onLangChange,
  volume,
  onVolumeChange,
  onReset,
  showTagline,
  t,
}: HeaderProps) {
  return (
    <header className="flex w-full flex-col items-center gap-3 pt-4 sm:pt-8">
      <button
        type="button"
        onClick={onReset}
        title={t.clearAll}
        className="font-league text-display text-gold text-glow-gold cursor-pointer uppercase transition-opacity hover:opacity-80 active:scale-[0.98]"
      >
        Rdraft
      </button>

      <div className="rule-gold h-px w-56 sm:w-80" />

      <div className="flex items-center gap-5 sm:gap-7">
        <LanguageMenu value={lang} onChange={onLangChange} />
        <div className="h-4 w-px bg-white/10" />
        <VolumeControl value={volume} onChange={onVolumeChange} label={t.volume} />
      </div>

      {showTagline && (
        <p className="text-body mt-1 max-w-[30ch] text-center text-balance text-stone-400/80 sm:max-w-[52ch]">
          {t.siteDescription}
        </p>
      )}
    </header>
  );
}
