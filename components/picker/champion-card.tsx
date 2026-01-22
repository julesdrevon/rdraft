"use client";

import { DraftSelection } from "@/types";
import { RefreshCw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";

interface ChampionCardProps {
  selection: DraftSelection;
  index: number;
  revealed: boolean;
  isFinished: boolean; 
  isSelected: boolean; 
  onClick: () => void;
  onReroll: () => void;
}

export function ChampionCard({
  selection,
  revealed,
  isFinished,
  isSelected,
  onClick,
  onReroll
}: ChampionCardProps) {
  
  
  
  
  
  
  const canClick = revealed && !selection.playerName; 
  
  return (
    <div className="flex flex-col items-center gap-1">
      {}
      <span className="text-[10px] font-black uppercase h-4 text-emerald-400">
        {selection.playerName || ""}
      </span>

      <div
        onClick={canClick ? onClick : undefined}
        className={`group h-24 w-24 overflow-hidden shrink-0 flex items-center justify-center bg-stone-900/50 transition-all border-none relative
          ${canClick ? 'cursor-pointer hover:ring-2 hover:ring-emerald-500/50' : 'cursor-default'}
          ${isSelected ? 'ring-2 ring-emerald-500 z-20 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : ''}
        `}
      >
        {revealed ? (
          <>
            <div className="relative w-full h-full"> 
               <Image
                src={selection.imageUrl}
                alt={selection.name}
                fill
                sizes="(max-width: 768px) 100px, 150px"
                className={`object-cover transition-all duration-500 ${selection.playerName && !isFinished ? 'grayscale opacity-60' : 'grayscale-0 opacity-100'}`}
              />
            </div>

            {}
            {isFinished && (
              <div
                onClick={(e) => { e.stopPropagation(); onReroll(); }}
                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 cursor-pointer backdrop-blur-sm"
              >
                 <RefreshCw className="h-6 w-6 text-white hover:text-emerald-400 transition-colors" />
              </div>
            )}

            {}
            {selection.lane && (
              <div className="absolute bottom-0 left-0 w-full bg-emerald-600 text-[10px] text-white py-0.5 font-bold text-center uppercase z-10">
                {selection.lane}
              </div>
            )}
          </>
        ) : (
          <Spinner className="text-emerald-500/50" />
        )}
      </div>

      <p className="text-[11px] font-bold text-emerald-500 truncate w-24 text-center">
        {revealed ? selection.name : "..."}
      </p>
    </div>
  );
}
