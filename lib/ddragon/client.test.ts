import { describe, expect, it } from "vitest";

import { splashableSkins, type ChampionSkin } from "./client";

/** Shape taken verbatim from Data Dragon's Kalista entry. */
const skins: ChampionSkin[] = [
  { num: 0, name: "default", chromas: false },
  { num: 1, name: "Blood Moon Kalista", chromas: false },
  { num: 2, name: "Worlds 2015 Kalista", chromas: true },
  { num: 4, name: "Worlds 2015 Kalista (Golden)", chromas: false, parentSkin: 2 },
  { num: 5, name: "Marauder Kalista", chromas: true },
  { num: 6, name: "Marauder Kalista (Citrine)", chromas: false, parentSkin: 5 },
];

describe("splashableSkins", () => {
  it("keeps the skins that actually have splash art", () => {
    expect(splashableSkins(skins).map((skin) => skin.num)).toEqual([0, 1, 2, 5]);
  });

  it("drops every chroma, which answers 403 on the CDN", () => {
    expect(splashableSkins(skins).every((skin) => skin.parentSkin === undefined)).toBe(true);
  });

  it("keeps a skin that merely has chromas of its own", () => {
    // `chromas: true` marks a parent, not a chroma: its own art exists.
    expect(splashableSkins(skins).map((skin) => skin.name)).toContain("Marauder Kalista");
  });

  it("handles a champion with no skins listed", () => {
    expect(splashableSkins([])).toEqual([]);
  });
});
