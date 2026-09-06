import { sample } from "@/lib/random";
import { communityDragon, type VoiceLine } from "@/lib/ddragon/urls";

/** Champion voice lines sit at half the master level, the draft stinger at a tenth. */
const VOICE_GAIN = 0.5;
const STINGER_GAIN = 0.1;

const HEARTSTEEL_STINGERS = [
  "https://static.wikia.nocookie.net/leagueoflegends/images/0/0f/Heartsteel_trigger_SFX_2.ogg",
  "https://static.wikia.nocookie.net/leagueoflegends/images/9/95/Heartsteel_trigger_SFX.ogg",
  "https://static.wikia.nocookie.net/leagueoflegends/images/8/87/Heartsteel_trigger_SFX_3.ogg",
];

/**
 * Voice lines stream from a CDN that can take a second to respond, so slots are
 * preloaded as soon as their champion is known. One line plays at a time: a new
 * one cuts the previous off rather than talking over it.
 */
class AudioManager {
  private voiceCache = new Map<string, HTMLAudioElement>();
  private nowPlaying: HTMLAudioElement | null = null;
  private master = 0.5;

  setMasterVolume(level: number) {
    this.master = level;
    for (const clip of this.voiceCache.values()) {
      clip.volume = VOICE_GAIN * level;
    }
  }

  preloadVoice(championKey: string | number, locale: string, line: VoiceLine = "choose") {
    if (typeof window === "undefined") return;

    const key = this.cacheKey(championKey, locale, line);
    if (this.voiceCache.has(key)) return;

    const clip = new Audio(communityDragon.championVoice(championKey, locale, line));
    clip.volume = VOICE_GAIN * this.master;
    clip.preload = "auto";
    this.voiceCache.set(key, clip);
  }

  playVoice(championKey: string | number, locale: string, line: VoiceLine = "choose") {
    if (typeof window === "undefined") return;

    this.stop();

    const key = this.cacheKey(championKey, locale, line);
    const clip =
      this.voiceCache.get(key) ??
      new Audio(communityDragon.championVoice(championKey, locale, line));

    clip.currentTime = 0;
    clip.volume = VOICE_GAIN * this.master;
    this.nowPlaying = clip;
    void clip.play().catch(() => {
      /* Autoplay blocked or the CDN 404'd for this champion; silence is fine. */
    });
  }

  /** The stinger that punctuates each champion reveal. */
  playRevealStinger() {
    if (typeof window === "undefined") return;

    const source = sample(HEARTSTEEL_STINGERS);
    if (!source) return;

    const clip = new Audio(source);
    clip.volume = STINGER_GAIN * this.master;
    void clip.play().catch(() => {});
  }

  stop() {
    if (!this.nowPlaying) return;
    this.nowPlaying.pause();
    this.nowPlaying.currentTime = 0;
  }

  private cacheKey(championKey: string | number, locale: string, line: VoiceLine) {
    return `${championKey}:${locale}:${line}`;
  }
}

export const audio = new AudioManager();
