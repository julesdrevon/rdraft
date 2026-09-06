"use client";

import { cn } from "@/lib/utils";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  "aria-label"?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  className,
  ...props
}: SliderProps) {
  const filled = ((value - min) / (max - min)) * 100;

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number.parseFloat(event.target.value))}
      className={cn("range-gold h-3 w-full touch-none select-none", className)}
      style={{
        background: `linear-gradient(to right, var(--color-gold) 0 ${filled}%, rgb(255 255 255 / 10%) ${filled}% 100%)`,
      }}
      {...props}
    />
  );
}
