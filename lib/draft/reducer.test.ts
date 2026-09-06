import { describe, expect, it } from "vitest";

import {
  currentPlayer,
  draftReducer,
  freeLanes,
  initialDraftState,
  isSlotSelectable,
  type DraftAction,
  type DraftState,
} from "./reducer";
import type { Champion, DraftSlot, Player } from "./types";

/* -------------------------------------------------------------------------- */
/* Fixtures                                                                   */
/* -------------------------------------------------------------------------- */

const player = (n: number): Player => ({ id: `p${n}`, name: `Player${n}`, iconId: n });

const slot = (n: number): DraftSlot => ({
  uid: `s${n}`,
  championId: `C${n}`,
  championKey: String(n),
  championName: `Champ${n}`,
  imageFull: `C${n}.png`,
  player: null,
  lane: null,
});

const champion = (id: string, name: string): Champion => ({
  id,
  key: "999",
  name,
  title: "",
  image: { full: `${id}.png`, sprite: "", group: "", x: 0, y: 0, w: 0, h: 0 },
  tags: [],
  partype: "",
});

const run = (state: DraftState, actions: DraftAction[]) => actions.reduce(draftReducer, state);

/** A lobby holding `count` players, still in the lobby phase. */
function lobbyOf(count: number): DraftState {
  return run(
    initialDraftState,
    Array.from({ length: count }, (_, i): DraftAction => ({ type: "player/add", player: player(i) })),
  );
}

/** A draft that has started but revealed nothing yet. */
function startedOf(count: number): DraftState {
  return draftReducer(lobbyOf(count), {
    type: "draft/start",
    players: Array.from({ length: count }, (_, i) => player(i)),
    slots: Array.from({ length: count }, (_, i) => slot(i)),
  });
}

/** A draft with every champion on the table and the roulette settled. */
function readyToAssign(count: number): DraftState {
  const revealed = run(
    startedOf(count),
    Array.from({ length: count }, (): DraftAction => ({ type: "draft/reveal" })),
  );
  return draftReducer(revealed, { type: "roulette/settle" });
}

/** Assign the slot at `index` to the lane, as a player would. */
const pick = (index: number, lane: DraftSlot["lane"]): DraftAction[] => [
  { type: "slot/select", index },
  { type: "slot/assign", lane: lane! },
  { type: "roulette/settle" },
];

/* -------------------------------------------------------------------------- */
/* Tests                                                                      */
/* -------------------------------------------------------------------------- */

describe("lobby", () => {
  it("caps the lobby at five players", () => {
    expect(lobbyOf(8).players).toHaveLength(5);
  });

  it("removes only the named player", () => {
    const after = draftReducer(lobbyOf(3), { type: "player/remove", id: "p1" });
    expect(after.players.map((p) => p.id)).toEqual(["p0", "p2"]);
  });

  it("refuses new players once the draft has started", () => {
    const after = draftReducer(startedOf(3), { type: "player/add", player: player(9) });
    expect(after.players).toHaveLength(3);
  });
});

describe("reveal sequence", () => {
  it("starts in the drawing phase with nothing revealed", () => {
    const state = startedOf(5);
    expect(state.phase).toBe("drawing");
    expect(state.revealed).toBe(0);
  });

  it("stays in drawing while slots remain hidden", () => {
    const state = run(startedOf(5), [{ type: "draft/reveal" }, { type: "draft/reveal" }]);
    expect(state.phase).toBe("drawing");
    expect(state.revealed).toBe(2);
  });

  it("switches to assigning on the last reveal", () => {
    const state = run(
      startedOf(5),
      Array.from({ length: 5 }, (): DraftAction => ({ type: "draft/reveal" })),
    );
    expect(state.phase).toBe("assigning");
    expect(state.revealed).toBe(5);
  });

  it("never reveals past the slot count", () => {
    const state = run(
      startedOf(3),
      Array.from({ length: 10 }, (): DraftAction => ({ type: "draft/reveal" })),
    );
    expect(state.revealed).toBe(3);
  });

  it("seeds the turn banner so it never renders blank", () => {
    const state = run(
      startedOf(3),
      Array.from({ length: 3 }, (): DraftAction => ({ type: "draft/reveal" })),
    );
    expect(state.rouletteName).toBe("Player0");
  });
});

describe("selection guards", () => {
  it("blocks selection while the roulette is still cycling", () => {
    const spinning = run(
      startedOf(3),
      Array.from({ length: 3 }, (): DraftAction => ({ type: "draft/reveal" })),
    );
    expect(isSlotSelectable(spinning, 0)).toBe(false);
  });

  it("allows selection of a free slot once settled", () => {
    expect(isSlotSelectable(readyToAssign(3), 0)).toBe(true);
  });

  it("ignores an out-of-range slot", () => {
    expect(draftReducer(readyToAssign(3), { type: "slot/select", index: 99 }).selectedSlot).toBeNull();
  });

  it("ignores a lane assigned with no champion selected", () => {
    const state = readyToAssign(3);
    expect(draftReducer(state, { type: "slot/assign", lane: "MID" })).toBe(state);
  });

  it("names the current player when the roulette settles", () => {
    const state = readyToAssign(3);
    expect(state.rouletteSettled).toBe(true);
    expect(state.rouletteName).toBe(currentPlayer(state)?.name);
  });
});

describe("assignment", () => {
  it("hands the champion its player and lane", () => {
    const state = run(readyToAssign(5), pick(0, "MID"));
    expect(state.slots[0].player?.id).toBe("p0");
    expect(state.slots[0].lane).toBe("MID");
  });

  it("advances the turn and retargets the banner", () => {
    const state = run(readyToAssign(5), pick(0, "MID"));
    expect(state.turn).toBe(1);
    expect(state.rouletteName).toBe("Player1");
    expect(state.rouletteSettled).toBe(true); // pick() settles the next roulette
  });

  it("stops offering a lane once it is taken", () => {
    const state = run(readyToAssign(5), pick(0, "MID"));
    expect(freeLanes(state.slots)).not.toContain("MID");
  });

  it("resolves the forced final pick in a full lobby", () => {
    const state = run(readyToAssign(5), [
      ...pick(0, "MID"),
      ...pick(1, "TOP"),
      ...pick(2, "JGL"),
      ...pick(3, "ADC"),
    ]);

    expect(state.phase).toBe("done");
    expect(state.slots.every((s) => s.player !== null && s.lane !== null)).toBe(true);
    expect(state.slots[4].player?.id).toBe("p4");
    expect(state.slots[4].lane).toBe("SUPP");
    expect(new Set(state.slots.map((s) => s.lane)).size).toBe(5);
  });

  it("still lets the last of three players choose a lane", () => {
    const state = run(readyToAssign(3), [...pick(0, "TOP"), ...pick(1, "MID")]);

    expect(state.phase).toBe("assigning");
    expect(state.turn).toBe(2);
    // Their champion is chosen for them — only one is left — but not their lane.
    expect(state.selectedSlot).toBe(2);
    expect(freeLanes(state.slots)).toHaveLength(3);

    const finished = draftReducer(state, { type: "slot/assign", lane: "SUPP" });
    expect(finished.phase).toBe("done");
    expect(finished.slots[2].lane).toBe("SUPP");
  });
});

describe("reroll", () => {
  const finished = run(readyToAssign(5), [
    ...pick(0, "MID"),
    ...pick(1, "TOP"),
    ...pick(2, "JGL"),
    ...pick(3, "ADC"),
  ]);

  it("swaps the champion and flags the slot", () => {
    const state = draftReducer(finished, {
      type: "slot/reroll",
      index: 2,
      champion: champion("CX", "Rerolled"),
    });

    expect(state.slots[2].championId).toBe("CX");
    expect(state.slots[2].championName).toBe("Rerolled");
    expect(state.rerolling).toContain("s2");
  });

  it("keeps the player and lane attached to the slot", () => {
    const state = draftReducer(finished, {
      type: "slot/reroll",
      index: 2,
      champion: champion("CX", "Rerolled"),
    });

    expect(state.slots[2].player).toEqual(finished.slots[2].player);
    expect(state.slots[2].lane).toBe(finished.slots[2].lane);
  });

  it("does not queue the same slot twice", () => {
    const once = draftReducer(finished, {
      type: "slot/reroll",
      index: 2,
      champion: champion("CX", "Rerolled"),
    });
    const twice = draftReducer(once, {
      type: "slot/reroll",
      index: 2,
      champion: champion("CY", "Again"),
    });

    expect(twice.rerolling).toHaveLength(1);
  });

  it("clears the flag when the new art has settled", () => {
    const rerolling = draftReducer(finished, {
      type: "slot/reroll",
      index: 2,
      champion: champion("CX", "Rerolled"),
    });

    expect(draftReducer(rerolling, { type: "slot/rerollSettled", uid: "s2" }).rerolling).toHaveLength(0);
  });
});

describe("locale changes", () => {
  it("renames known champions and leaves the rest alone", () => {
    const state = draftReducer(startedOf(3), {
      type: "champions/relabel",
      names: { C0: "Champ0-KO", C2: "Champ2-KO" },
    });

    expect(state.slots.map((s) => s.championName)).toEqual(["Champ0-KO", "Champ1", "Champ2-KO"]);
  });
});

describe("reset", () => {
  it("returns to an empty lobby", () => {
    expect(draftReducer(startedOf(4), { type: "reset" })).toEqual(initialDraftState);
  });
});
