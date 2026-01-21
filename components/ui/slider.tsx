"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

export function Slider({ 
  value, 
  onChange, 
  min = 0, 
  max = 1, 
  step = 0.01, 
  className 
}: SliderProps) {
  return (
    <div className={cn("relative flex items-center select-none touch-none w-full h-5", className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-[#c89c38] hover:accent-[#a6822d] transition-all"
        style={{
          background: `linear-gradient(to right, #c89c38 0%, #c89c38 ${value * 100}%, #292524 ${value * 100}%, #292524 100%)`
        }}
      />
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #c89c38;
          border: 2px solid #1c1917;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          transition: transform 0.1s ease;
        }
        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  )
}
