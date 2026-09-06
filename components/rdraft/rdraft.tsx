"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { audio } from "@/lib/audio/manager";
import { getChampions, getLatestVersion, getRandomSplash } from "@/lib/ddragon/client";
import { draftReducer, initialDraftState } from "@/lib/draft/reducer";
import type { Champion, DraftSlot, Lane } from "@/lib/draft/types";
import { DEFAULT_LANG, LOCALES, type LangCode } from "@/lib/i18n";
import { sample, sampleMany, shuffle } from "@/lib/random";

import { Header } from "./header";
import { SecretGame } from "./secret-game";
import { SplashBackdrop } from "./splash-backdrop";
import { StageDraft } from "./stage-draft";
import { StageLobby } from "./stage-lobby";
import { StageResults } from "./stage-results";

const MIN_PLAYERS = 2;
const REVEAL_INTERVAL_MS = 1000;
const ROULETTE_TICKS = 15;
const ROULETTE_STEP_MS = 60;
const LANG_KEY = "rdraft:lang";
const VOLUME_KEY = "rdraft:volume";

/** Champion names change with the language; splash art does not. */
const SPLASH_LOCALE = "en_US";

export function Rdraft() {
  const [state, dispatch] = React.useReducer(draftReducer, initialDraftState);

  const [lang, setLang] = React.useState<LangCode>(DEFAULT_LANG);
  const [volume, setVolume] = React.useState(0.5);
  const [version, setVersion] = React.useState("");
  const [pool, setPool] = React.useState<Champion[]>([]);
  const [backdrop, setBackdrop] = React.useState<string | null>(null);
  const [failed, setFailed] = React.useState(false);

  const locale = LOCALES[lang];
  const t = locale.dict;

  /* ------------------------------------------------------------ preferences */

  // Read after mount rather than during render: the server has no localStorage,
  // and a lazy initialiser would hydrate with a different value.
  React.useEffect(() => {
    const storedLang = window.localStorage.getItem(LANG_KEY);
    if (storedLang && storedLang in LOCALES) setLang(storedLang as LangCode);

    const storedVolume = Number.parseFloat(window.localStorage.getItem(VOLUME_KEY) ?? "");
    if (Number.isFinite(storedVolume)) setVolume(Math.min(1, Math.max(0, storedVolume)));
  }, []);

  React.useEffect(() => {
    audio.setMasterVolume(volume);
    window.localStorage.setItem(VOLUME_KEY, String(volume));
  }, [volume]);

  React.useEffect(() => {
    window.localStorage.setItem(LANG_KEY, lang);
  }, [lang]);

  /* ------------------------------------------------------------------- data */

  const loadVersion = React.useCallback(() => {
    setFailed(false);
    getLatestVersion()
      .then(setVersion)
      .catch(() => setFailed(true));
  }, []);

  React.useEffect(loadVersion, [loadVersion]);

  // Champion names follow the language. Data Dragon is cached per version and
  // locale, so returning to a language already seen costs no request.
  React.useEffect(() => {
    if (!version) return;
    let cancelled = false;

    getChampions(version, locale.data)
      .then((champions) => {
        if (cancelled) return;
        setPool(champions);
        dispatch({
          type: "champions/relabel",
          names: Object.fromEntries(champions.map((champion) => [champion.id, champion.name])),
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [version, locale.data]);

  React.useEffect(() => {
    if (!version) return;
    let cancelled = false;

    getRandomSplash(version, SPLASH_LOCALE).then((url) => {
      if (!cancelled) setBackdrop(url);
    });

    return () => {
      cancelled = true;
    };
  }, [version]);

  /* ---------------------------------------------------------------- reveals */

  React.useEffect(() => {
    if (state.phase !== "drawing") return;
    const id = window.setInterval(() => dispatch({ type: "draft/reveal" }), REVEAL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [state.phase]);

  React.useEffect(() => {
    if (state.revealed === 0) return;
    audio.playRevealStinger();
  }, [state.revealed]);

  /* --------------------------------------------------------------- roulette */

  React.useEffect(() => {
    if (state.phase !== "assigning") return;

    const names = state.players.map((player) => player.name);
    if (names.length === 0) return;

    let ticks = 0;
    const id = window.setInterval(() => {
      ticks += 1;
      if (ticks >= ROULETTE_TICKS) {
        window.clearInterval(id);
        dispatch({ type: "roulette/settle" });
        return;
      }
      dispatch({ type: "roulette/tick", name: sample(names) ?? names[0] });
    }, ROULETTE_STEP_MS);

    return () => window.clearInterval(id);
  }, [state.phase, state.turn, state.players]);

  /* ------------------------------------------------------------------ audio */

  React.useEffect(() => {
    if (!state.lastAssigned) return;
    const slot = state.slots.find((candidate) => candidate.uid === state.lastAssigned);
    if (slot) audio.playVoice(slot.championKey, locale.voice);
    // Only a fresh pick should speak: re-running on a language change would
    // replay the last line for no reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.lastAssigned]);

  /* ---------------------------------------------------------------- actions */

  const addPlayer = (name: string, iconId: number) => {
    dispatch({ type: "player/add", player: { id: crypto.randomUUID(), name, iconId } });
  };

  const startDraft = () => {
    if (pool.length === 0 || state.players.length < MIN_PLAYERS) return;

    const players = shuffle(state.players);
    const stamp = Date.now();
    const slots: DraftSlot[] = sampleMany(pool, players.length).map((champion, index) => ({
      uid: `slot-${index}-${stamp}`,
      championId: champion.id,
      championKey: champion.key,
      championName: champion.name,
      imageFull: champion.image.full,
      player: null,
      lane: null,
    }));

    for (const slot of slots) audio.preloadVoice(slot.championKey, locale.voice);
    dispatch({ type: "draft/start", players, slots });
  };

  const reroll = (index: number) => {
    const taken = new Set(state.slots.map((slot) => slot.championId));
    const champion = sample(pool.filter((candidate) => !taken.has(candidate.id)));
    if (!champion) return;

    audio.preloadVoice(champion.key, locale.voice);
    dispatch({ type: "slot/reroll", index, champion });
  };

  const settleReroll = (uid: string) => {
    const slot = state.slots.find((candidate) => candidate.uid === uid);
    if (slot) audio.playVoice(slot.championKey, locale.voice);
    dispatch({ type: "slot/rerollSettled", uid });
  };

  const reset = () => {
    dispatch({ type: "reset" });
  };

  /* ----------------------------------------------------------------- render */

  const ready = pool.length > 0;

  return (
    <>
      <SplashBackdrop src={backdrop} />

      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col items-center gap-8 px-4 pb-24 sm:gap-10">
        <Header
          lang={lang}
          onLangChange={setLang}
          volume={volume}
          onVolumeChange={setVolume}
          onReset={reset}
          showTagline={state.phase === "lobby"}
          t={t}
        />

        <div className="flex w-full flex-1 flex-col items-center justify-center gap-8">
          {failed && (
            <div className="panel flex flex-col items-center gap-4 rounded-xl px-6 py-5">
              <p className="text-body max-w-[42ch] text-center text-stone-300">{t.dataError}</p>
              <Button
                onClick={loadVersion}
                className="text-label bg-gold hover:bg-gold-bright cursor-pointer text-stone-950"
              >
                {t.retry}
              </Button>
            </div>
          )}

          {state.phase === "lobby" && (
            <>
              <StageLobby
                players={state.players}
                version={version}
                onAddPlayer={addPlayer}
                onRemovePlayer={(id) => dispatch({ type: "player/remove", id })}
                t={t}
              />
              <Button
                onClick={startDraft}
                disabled={state.players.length < MIN_PLAYERS || !ready}
                size="lg"
                className="text-label bg-gold hover:bg-gold-bright cursor-pointer px-8 text-stone-950 shadow-[0_0_28px_-10px_rgba(200,156,56,0.9)]"
              >
                {t.startDraft}
              </Button>
            </>
          )}

          {(state.phase === "drawing" || state.phase === "assigning") && (
            <StageDraft
              state={state}
              version={version}
              onSelectSlot={(index) => dispatch({ type: "slot/select", index })}
              onAssignLane={(lane: Lane) => dispatch({ type: "slot/assign", lane })}
              onRestart={startDraft}
              onReset={reset}
              t={t}
            />
          )}

          {state.phase === "done" && (
            <StageResults
              slots={state.slots}
              rerolling={state.rerolling}
              version={version}
              onReroll={reroll}
              onRerollSettled={settleReroll}
              onRestart={startDraft}
              onReset={reset}
              t={t}
            />
          )}
        </div>
      </main>

      <SecretGame pool={pool} version={version} voiceLocale={locale.voice} t={t} />
    </>
  );
}
