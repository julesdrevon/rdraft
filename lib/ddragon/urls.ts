import type { Lane } from "@/lib/draft/types";

const DDRAGON = "https://ddragon.leagueoflegends.com";
const CDRAGON = "https://raw.communitydragon.org/latest";

/**
 * Every Riot CDN URL the app builds lives here, so a path change is a
 * one-line edit instead of a hunt through the components.
 */
export const ddragon = {
  versions: () => `${DDRAGON}/api/versions.json`,

  championList: (version: string, locale: string) =>
    `${DDRAGON}/cdn/${version}/data/${locale}/champion.json`,

  championDetail: (version: string, locale: string, championId: string) =>
    `${DDRAGON}/cdn/${version}/data/${locale}/champion/${championId}.json`,

  /** Square portrait. `imageFull` is the `image.full` field, e.g. `Ahri.png`. */
  championSquare: (version: string, imageFull: string) =>
    `${DDRAGON}/cdn/${version}/img/champion/${imageFull}`,

  /** Tall loading-screen art, used for the result cards. */
  championLoading: (championId: string, skin = 0) =>
    `${DDRAGON}/cdn/img/champion/loading/${championId}_${skin}.jpg`,

  /** Full-bleed splash art, used for the page backdrop. */
  championSplash: (championId: string, skin: number) =>
    `${DDRAGON}/cdn/img/champion/splash/${championId}_${skin}.jpg`,

  profileIcon: (version: string, iconId: number) =>
    `${DDRAGON}/cdn/${version}/img/profileicon/${iconId}.png`,
};

export type VoiceLine = "choose" | "ban";

export const communityDragon = {
  championVoice: (championKey: string | number, locale: string, line: VoiceLine) =>
    `${CDRAGON}/plugins/rcp-be-lol-game-data/global/${locale}/v1/champion-${line}-vo/${championKey}.ogg`,
};

/** Served from `public/lanes`, recoloured through `currentColor`. */
export const LANE_ICONS: Record<Lane, string> = {
  TOP: "/lanes/top.svg",
  JGL: "/lanes/jgl.svg",
  MID: "/lanes/mid.svg",
  ADC: "/lanes/adc.svg",
  SUPP: "/lanes/supp.svg",
};
