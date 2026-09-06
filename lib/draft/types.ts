export const LANES = ["TOP", "JGL", "MID", "ADC", "SUPP"] as const;

export type Lane = (typeof LANES)[number];

export interface ChampionImage {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A champion as returned by the Data Dragon `champion.json` listing. */
export interface Champion {
  id: string;
  key: string;
  name: string;
  title: string;
  image: ChampionImage;
  tags: string[];
  partype: string;
}

export interface Player {
  /** Stable across renders and re-orders, unlike an array index. */
  id: string;
  name: string;
  iconId: number;
}

/** One drafted champion and the player it ends up assigned to. */
export interface DraftSlot {
  uid: string;
  championId: string;
  championKey: string;
  championName: string;
  /** Filename of the square portrait, e.g. `Ahri.png`. */
  imageFull: string;
  player: Player | null;
  lane: Lane | null;
}

export type Phase = "lobby" | "drawing" | "assigning" | "done";

export const MAX_PLAYERS = 5;
