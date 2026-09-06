"use client";

import * as React from "react";

import { MAX_PLAYERS, type Player } from "@/lib/draft/types";
import type { Translation } from "@/lib/i18n";

import { AddPlayerDialog } from "./add-player-dialog";
import { PlayerSlot } from "./player-slot";

/** Seats fill from the middle outwards, so a half-empty lobby stays centred. */
const FILL_ORDER = [2, 1, 3, 0, 4];

interface StageLobbyProps {
  players: Player[];
  version: string;
  onAddPlayer: (name: string, iconId: number) => void;
  onRemovePlayer: (id: string) => void;
  t: Translation;
}

export function StageLobby({
  players,
  version,
  onAddPlayer,
  onRemovePlayer,
  t,
}: StageLobbyProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [typedName, setTypedName] = React.useState("");

  const isFull = players.length >= MAX_PLAYERS;

  const openDialog = React.useCallback(
    (prefill: string) => {
      if (isFull) return;
      setTypedName(prefill);
      setDialogOpen(true);
    },
    [isFull],
  );

  /** Start typing anywhere to add a player, the way a chat box would behave. */
  React.useEffect(() => {
    if (dialogOpen || isFull) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") {
        return;
      }
      if (event.key.length !== 1 || event.ctrlKey || event.altKey || event.metaKey) return;
      openDialog(event.key);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialogOpen, isFull, openDialog]);

  const seats = React.useMemo(() => {
    const filled: (Player | null)[] = Array(MAX_PLAYERS).fill(null);
    players.forEach((player, index) => {
      const seat = FILL_ORDER[index];
      if (seat !== undefined) filled[seat] = player;
    });
    return filled;
  }, [players]);

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex flex-nowrap items-center justify-center gap-1.5 sm:gap-5">
        {seats.map((player, seat) => (
          <PlayerSlot
            key={player?.id ?? `empty-${seat}`}
            player={player}
            emphasised={seat === 2}
            version={version}
            onAdd={() => openDialog("")}
            onRemove={() => player && onRemovePlayer(player.id)}
            t={t}
          />
        ))}
      </div>

      <AddPlayerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={onAddPlayer}
        initialValue={typedName}
        version={version}
        t={t}
      />
    </div>
  );
}
