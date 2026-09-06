import type { Champion } from "@/lib/draft/types";
import { sample } from "@/lib/random";
import { ddragon } from "./urls";

/**
 * Data Dragon is immutable per version, so anything keyed by version can be
 * cached for the lifetime of the tab. Resolved values and in-flight requests
 * are tracked separately: caching the promise alone would let one aborted
 * consumer poison the entry for every other caller.
 */
const versionCache: { value?: string; inFlight?: Promise<string> } = {};
const championCache = new Map<string, Champion[]>();
const championInFlight = new Map<string, Promise<Champion[]>>();

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Data Dragon replied ${response.status} for ${url}`);
  }
  return (await response.json()) as T;
}

export async function getLatestVersion(): Promise<string> {
  if (versionCache.value) return versionCache.value;
  if (!versionCache.inFlight) {
    versionCache.inFlight = getJson<string[]>(ddragon.versions())
      .then((versions) => {
        const latest = versions[0];
        if (!latest) throw new Error("Data Dragon returned no versions");
        versionCache.value = latest;
        return latest;
      })
      .finally(() => {
        versionCache.inFlight = undefined;
      });
  }
  return versionCache.inFlight;
}

/** Champions already in cache, for rendering without a loading state. */
export function peekChampions(version: string, locale: string): Champion[] | undefined {
  return championCache.get(`${version}:${locale}`);
}

export async function getChampions(version: string, locale: string): Promise<Champion[]> {
  const key = `${version}:${locale}`;
  const cached = championCache.get(key);
  if (cached) return cached;

  const pending = championInFlight.get(key);
  if (pending) return pending;

  const request = getJson<{ data: Record<string, Champion> }>(
    ddragon.championList(version, locale),
  )
    .then((payload) => {
      const champions = Object.values(payload.data);
      championCache.set(key, champions);
      return champions;
    })
    .finally(() => {
      championInFlight.delete(key);
    });

  championInFlight.set(key, request);
  return request;
}

/** Splash art of a random skin of a random champion, for the backdrop. */
export async function getRandomSplash(version: string, locale: string): Promise<string | null> {
  try {
    const champions = await getChampions(version, locale);
    const champion = sample(champions);
    if (!champion) return null;

    const detail = await getJson<{
      data: Record<string, { skins: { num: number }[] }>;
    }>(ddragon.championDetail(version, locale, champion.id));

    const skin = sample(detail.data[champion.id]?.skins ?? []);
    if (!skin) return null;

    return ddragon.championSplash(champion.id, skin.num);
  } catch {
    return null;
  }
}
