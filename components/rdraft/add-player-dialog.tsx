"use client";

import * as React from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ddragon } from "@/lib/ddragon/urls";
import type { Translation } from "@/lib/i18n";
import { sample } from "@/lib/random";

/**
 * Profile icon ids Riot has kept available. Picking outside these ranges
 * regularly 404s, which would leave an empty circle in the lobby.
 */
const SAFE_ICON_IDS = [
  0,
  1,
  2,
  ...Array.from({ length: 20 }, (_, i) => 10 + i),
  ...Array.from({ length: 29 }, (_, i) => 50 + i),
  ...Array.from({ length: 50 }, (_, i) => 1000 + i),
];

interface AddPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string, iconId: number) => void;
  initialValue?: string;
  version: string;
  t: Translation;
}

export function AddPlayerDialog({
  open,
  onOpenChange,
  onConfirm,
  initialValue = "",
  version,
  t,
}: AddPlayerDialogProps) {
  const [name, setName] = React.useState("");
  const [iconId, setIconId] = React.useState(SAFE_ICON_IDS[0]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    setName(initialValue);
    setIconId(sample(SAFE_ICON_IDS) ?? SAFE_ICON_IDS[0]);
    const focus = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(focus);
  }, [open, initialValue]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onConfirm(trimmed, iconId);
    setName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="panel top-1/3 max-w-sm rounded-xl border-0 duration-0 animate-none sm:top-1/2 data-[state=closed]:animate-none data-[state=open]:animate-none">
        <DialogHeader className="flex flex-col items-center gap-4">
          <div className="border-gold/30 relative mt-1 size-20 overflow-hidden rounded-full border bg-black/50 shadow-lg">
            {version && (
              <Image
                src={ddragon.profileIcon(version, iconId)}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <DialogTitle className="text-title text-gold text-center uppercase">
              {t.addPlayerModal}
            </DialogTitle>
            <DialogDescription className="text-center text-stone-400">
              {t.enterUsername}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-5 pt-2">
          <Input
            ref={inputRef}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t.usernamePlaceholder}
            maxLength={24}
            className="h-12 border-white/10 bg-black/30 text-center text-lg"
          />

          <DialogFooter className="gap-2 sm:justify-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer hover:bg-white/5"
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="text-label bg-gold hover:bg-gold-bright cursor-pointer px-8 text-stone-950"
            >
              {t.add}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
