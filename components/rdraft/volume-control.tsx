"use client";

import { Volume1, Volume2, VolumeX } from "lucide-react";

import { Slider } from "@/components/ui/slider";

interface VolumeControlProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

export function VolumeControl({ value, onChange, label }: VolumeControlProps) {
  const Icon = value === 0 ? VolumeX : value < 0.5 ? Volume1 : Volume2;

  return (
    <div className="group flex items-center gap-2.5">
      <button
        type="button"
        onClick={() => onChange(value === 0 ? 0.5 : 0)}
        aria-label={value === 0 ? "Réactiver le son" : "Couper le son"}
        className="hover:text-gold cursor-pointer text-stone-500 transition-colors"
      >
        <Icon className="size-4" />
      </button>
      <Slider
        value={value}
        onChange={onChange}
        aria-label={label}
        className="w-28 sm:w-40"
      />
    </div>
  );
}
