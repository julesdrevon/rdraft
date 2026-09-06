import { LANES, MAX_PLAYERS, type Champion, type DraftSlot, type Lane, type Phase, type Player } from "./types";

export interface DraftState {
  phase: Phase;
  players: Player[];
  slots: DraftSlot[];
  /** How many slots have had their champion revealed, in order. */
  revealed: number;
  /** Index into `players` of whoever is picking right now. */
  turn: number;
  selectedSlot: number | null;
  /** Name shown by the "who picks next" roulette. */
  rouletteName: string;
  /** False while the roulette is still cycling names. */
  rouletteSettled: boolean;
  /** uids of slots waiting on a rerolled portrait. */
  rerolling: string[];
  /** uid of the slot that just received a lane, so its voice line can play. */
  lastAssigned: string | null;
}

export type DraftAction =
  | { type: "player/add"; player: Player }
  | { type: "player/remove"; id: string }
  | { type: "draft/start"; players: Player[]; slots: DraftSlot[] }
  | { type: "draft/reveal" }
  | { type: "roulette/tick"; name: string }
  | { type: "roulette/settle" }
  | { type: "slot/select"; index: number }
  | { type: "slot/assign"; lane: Lane }
  | { type: "slot/reroll"; index: number; champion: Champion }
  | { type: "slot/rerollSettled"; uid: string }
  | { type: "champions/relabel"; names: Record<string, string> }
  | { type: "reset" };

export const initialDraftState: DraftState = {
  phase: "lobby",
  players: [],
  slots: [],
  revealed: 0,
  turn: 0,
  selectedSlot: null,
  rouletteName: "",
  rouletteSettled: false,
  rerolling: [],
  lastAssigned: null,
};

export function freeLanes(slots: readonly DraftSlot[]): Lane[] {
  return LANES.filter((lane) => !slots.some((slot) => slot.lane === lane));
}

export function currentPlayer(state: DraftState): Player | undefined {
  return state.players[state.turn];
}

/** A slot can be picked only once every champion is on the table and it is free. */
export function isSlotSelectable(state: DraftState, index: number): boolean {
  return (
    state.phase === "assigning" &&
    state.rouletteSettled &&
    state.slots[index]?.player === null
  );
}

export function draftReducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case "player/add": {
      if (state.phase !== "lobby" || state.players.length >= MAX_PLAYERS) return state;
      return { ...state, players: [...state.players, action.player] };
    }

    case "player/remove": {
      if (state.phase !== "lobby") return state;
      return { ...state, players: state.players.filter((p) => p.id !== action.id) };
    }

    case "draft/start": {
      return {
        ...initialDraftState,
        phase: "drawing",
        players: action.players,
        slots: action.slots,
      };
    }

    case "draft/reveal": {
      if (state.phase !== "drawing") return state;
      const revealed = Math.min(state.revealed + 1, state.slots.length);
      const done = revealed === state.slots.length;
      return {
        ...state,
        revealed,
        phase: done ? "assigning" : "drawing",
        // Seed the banner with the real name so it never renders blank.
        rouletteName: done ? (state.players[0]?.name ?? "") : state.rouletteName,
      };
    }

    case "roulette/tick": {
      return { ...state, rouletteName: action.name, rouletteSettled: false };
    }

    case "roulette/settle": {
      const player = currentPlayer(state);
      return {
        ...state,
        rouletteName: player?.name ?? state.rouletteName,
        rouletteSettled: true,
      };
    }

    case "slot/select": {
      if (!isSlotSelectable(state, action.index)) return state;
      return { ...state, selectedSlot: action.index };
    }

    case "slot/assign": {
      if (state.phase !== "assigning") return state;
      return assignLane(state, action.lane);
    }

    case "slot/reroll": {
      const slot = state.slots[action.index];
      if (!slot) return state;
      return {
        ...state,
        rerolling: state.rerolling.includes(slot.uid)
          ? state.rerolling
          : [...state.rerolling, slot.uid],
        slots: state.slots.map((current, index) =>
          index === action.index
            ? {
                ...current,
                championId: action.champion.id,
                championKey: action.champion.key,
                championName: action.champion.name,
                imageFull: action.champion.image.full,
              }
            : current,
        ),
      };
    }

    case "slot/rerollSettled": {
      if (!state.rerolling.includes(action.uid)) return state;
      return { ...state, rerolling: state.rerolling.filter((uid) => uid !== action.uid) };
    }

    case "champions/relabel": {
      return {
        ...state,
        slots: state.slots.map((slot) => ({
          ...slot,
          championName: action.names[slot.championId] ?? slot.championName,
        })),
      };
    }

    case "reset":
      return initialDraftState;

    default:
      return state;
  }
}

function assignLane(state: DraftState, lane: Lane): DraftState {
  const index = state.selectedSlot;
  const player = currentPlayer(state);
  if (index === null || !player) return state;

  const slots = state.slots.map((slot, i) =>
    i === index ? { ...slot, player, lane } : slot,
  );
  const turn = state.turn + 1;

  const next: DraftState = {
    ...state,
    slots,
    turn,
    selectedSlot: null,
    lastAssigned: slots[index].uid,
    rouletteName: state.players[turn]?.name ?? "",
    rouletteSettled: false,
    phase: turn >= state.players.length ? "done" : state.phase,
  };

  return next.phase === "done" ? next : autoResolveFinalPick(next);
}

/**
 * The last player has nothing to decide: one champion is left, and in a full
 * lobby one lane is left with it. Resolve what is forced rather than asking.
 */
function autoResolveFinalPick(state: DraftState): DraftState {
  if (state.phase !== "assigning" || state.turn !== state.players.length - 1) return state;

  let next = state;

  if (next.selectedSlot === null) {
    const remaining = next.slots.findIndex((slot) => slot.player === null);
    if (remaining === -1) return next;
    next = { ...next, selectedSlot: remaining };
  }

  const remainingLanes = freeLanes(next.slots);
  return remainingLanes.length === 1 ? assignLane(next, remainingLanes[0]) : next;
}
