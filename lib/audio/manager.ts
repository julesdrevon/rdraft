import { sample } from "@/lib/random";
import { REVEAL_STINGERS, communityDragon, type VoiceLine } from "@/lib/ddragon/urls";

/** Champion voice lines sit at half the master level, the draft stinger at a tenth. */
const VOICE_GAIN = 0.5;
const STINGER_GAIN = 0.1;

/**
 * Decoded PCM weighs a megabyte or so per line, far more than the .ogg it came
 * from, so both caches are bounded — a long session of rerolls would otherwise
 * hold every champion it ever spoke.
 */
const MAX_BUFFERS = 16;
const MAX_ELEMENTS = 16;

/** Lines are needed a second apart at most; a narrow pipe leaves bandwidth for the art. */
const MAX_PARALLEL_LOADS = 2;

type Source = AudioBufferSourceNode | HTMLAudioElement;

/**
 * Clips stream from CDNs that can take a second to answer, so everything is
 * fetched and decoded ahead of the moment it is needed. Decoded buffers play
 * through the Web Audio graph, which starts on the frame it is asked to — an
 * `<audio>` element only starts once the browser feels ready, which is what
 * made the first voice line lag behind its reveal.
 *
 * One voice plays at a time: a new one cuts the previous off rather than
 * talking over it. Stingers are free to overlap.
 */
class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private level = 0.5;

  private buffers = new Map<string, AudioBuffer>();
  private loading = new Map<string, Promise<AudioBuffer | null>>();
  /** URLs the CDN has no clip for, or that this browser cannot decode. */
  private rejected = new Set<string>();
  /** Fallback elements for browsers without a working Ogg decoder. */
  private elements = new Map<string, HTMLAudioElement>();
  /** Which of the two gains a clip belongs to, for the fallback path. */
  private gains = new Map<string, number>();

  private queue: string[] = [];
  private active = 0;

  private voice: Source | null = null;
  /** Guards against a slow load speaking over whatever was asked for since. */
  private voiceToken = 0;

  private armed = false;

  setMasterVolume(level: number) {
    this.level = level;
    if (this.master) this.master.gain.value = level;
    for (const [url, clip] of this.elements) {
      clip.volume = (this.gains.get(url) ?? VOICE_GAIN) * level;
    }

    // The first call happens on mount, which is the earliest point a gesture
    // listener can be armed: browsers keep a context suspended until the user
    // has interacted, and the stingers are wanted the instant a draft starts.
    this.armUnlock();
  }

  preloadVoice(championKey: string | number, locale: string, line: VoiceLine = "choose") {
    this.enqueue(communityDragon.championVoice(championKey, locale, line));
  }

  playVoice(championKey: string | number, locale: string, line: VoiceLine = "choose") {
    const url = communityDragon.championVoice(championKey, locale, line);

    // Stopping bumps the token, so this claim is taken after it: anything still
    // loading from an earlier call is now stale and will decline to speak.
    this.stop();
    const token = this.voiceToken;

    this.play(url, VOICE_GAIN, (source) => {
      if (token !== this.voiceToken) return false;
      this.voice = source;
      return true;
    });
  }

  /** The stinger that punctuates each champion reveal. */
  playRevealStinger() {
    const url = sample(REVEAL_STINGERS);
    if (url) this.play(url, STINGER_GAIN);
  }

  stop() {
    // Invalidates any claim still in flight, so a clip that finishes loading
    // after a stop stays silent instead of starting late.
    this.voiceToken += 1;

    const playing = this.voice;
    this.voice = null;
    if (!playing) return;

    if (playing instanceof HTMLAudioElement) {
      playing.pause();
      playing.currentTime = 0;
      return;
    }

    try {
      playing.stop();
    } catch {
      /* Already finished on its own. */
    }
  }

  /* -------------------------------------------------------------- playback */

  /**
   * `claim` gets the chance to reject a clip whose load finished too late to
   * still be wanted, and to record it as the one now playing.
   */
  private play(url: string, gain: number, claim?: (source: Source) => boolean) {
    this.gains.set(url, gain);

    const ctx = this.context();
    if (!ctx) {
      this.playElement(url, gain, claim);
      return;
    }

    const buffered = this.buffers.get(url);
    if (buffered) {
      this.playBuffer(ctx, url, buffered, gain, claim);
      return;
    }

    if (this.rejected.has(url)) {
      this.playElement(url, gain, claim);
      return;
    }

    void this.load(url).then((buffer) => {
      if (buffer) this.playBuffer(ctx, url, buffer, gain, claim);
      else this.playElement(url, gain, claim);
    });
  }

  private playBuffer(
    ctx: AudioContext,
    url: string,
    buffer: AudioBuffer,
    gain: number,
    claim?: (source: Source) => boolean,
  ) {
    this.touch(url);
    void ctx.resume().catch(() => {});

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const trim = ctx.createGain();
    trim.gain.value = gain;
    source.connect(trim).connect(this.masterGain(ctx));

    if (claim && !claim(source)) return;
    source.start();
  }

  /** Creates the fallback element, which starts buffering as soon as it exists. */
  private element(url: string): HTMLAudioElement | null {
    if (typeof window === "undefined") return null;

    const existing = this.elements.get(url);
    if (existing) return existing;

    const clip = new Audio(url);
    clip.preload = "auto";
    this.elements.set(url, clip);

    while (this.elements.size > MAX_ELEMENTS) {
      const oldest = this.elements.keys().next().value;
      if (oldest === undefined) break;
      this.elements.delete(oldest);
    }

    return clip;
  }

  private playElement(url: string, gain: number, claim?: (source: Source) => boolean) {
    const clip = this.element(url);
    if (!clip) return;

    clip.volume = gain * this.level;
    clip.currentTime = 0;
    if (claim && !claim(clip)) return;

    void clip.play().catch(() => {
      /* Autoplay blocked or the CDN 404'd for this champion; silence is fine. */
    });
  }

  /* --------------------------------------------------------------- loading */

  private enqueue(url: string, gain = VOICE_GAIN) {
    if (typeof window === "undefined") return;
    this.gains.set(url, gain);

    if (this.buffers.has(url) || this.loading.has(url) || this.rejected.has(url)) return;
    if (this.queue.includes(url)) return;

    this.queue.push(url);
    this.drain();
  }

  private drain() {
    while (this.active < MAX_PARALLEL_LOADS) {
      const url = this.queue.shift();
      if (!url) return;

      this.active += 1;
      void this.load(url).finally(() => {
        this.active -= 1;
        this.drain();
      });
    }
  }

  private load(url: string): Promise<AudioBuffer | null> {
    const cached = this.buffers.get(url);
    if (cached) return Promise.resolve(cached);

    const pending = this.loading.get(url);
    if (pending) return pending;

    const ctx = this.context();
    if (!ctx) return Promise.resolve(null);

    const request = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Voice CDN replied ${response.status}`);
        return response.arrayBuffer();
      })
      .then((bytes) => ctx.decodeAudioData(bytes))
      .then((buffer) => {
        this.remember(url, buffer);
        return buffer;
      })
      .catch(() => {
        // A missing clip, or an Ogg this browser cannot decode. Handing the URL
        // to an element keeps the preload honest there too: it starts buffering
        // now rather than at the moment it is asked to play.
        this.rejected.add(url);
        this.element(url);
        return null;
      })
      .finally(() => {
        this.loading.delete(url);
      });

    this.loading.set(url, request);
    return request;
  }

  private remember(url: string, buffer: AudioBuffer) {
    this.buffers.set(url, buffer);
    // Map iteration is insertion-ordered, so the oldest untouched clip is first.
    while (this.buffers.size > MAX_BUFFERS) {
      const oldest = this.buffers.keys().next().value;
      if (oldest === undefined) break;
      this.buffers.delete(oldest);
    }
  }

  /** Re-inserting moves a clip to the young end of the eviction order. */
  private touch(url: string) {
    const buffer = this.buffers.get(url);
    if (!buffer) return;
    this.buffers.delete(url);
    this.buffers.set(url, buffer);
  }

  /* ------------------------------------------------------------- lifecycle */

  private context(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (this.ctx) return this.ctx;

    const Ctor =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;

    this.ctx = new Ctor();
    return this.ctx;
  }

  private masterGain(ctx: AudioContext): GainNode {
    if (!this.master) {
      this.master = ctx.createGain();
      this.master.connect(ctx.destination);
    }
    this.master.gain.value = this.level;
    return this.master;
  }

  /** Resume the context and warm the stingers on the first gesture, once. */
  private armUnlock() {
    if (this.armed || typeof window === "undefined") return;
    this.armed = true;

    const unlock = () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);

      const ctx = this.context();
      if (ctx) void ctx.resume().catch(() => {});
      for (const url of REVEAL_STINGERS) this.enqueue(url, STINGER_GAIN);
    };

    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true });
  }
}

export const audio = new AudioManager();
