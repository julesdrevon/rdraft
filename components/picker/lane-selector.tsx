"use client";

import { Button } from "@/components/ui/button";

const ALL_LANES = ["TOP", "JGL", "MID", "ADC", "SUPP"];

interface LaneSelectorProps {
  takenLanes: (string | null)[];
  onSelect: (lane: string) => void;
  disabled?: boolean;
  t: any;
}


const LANE_ICONS: Record<string, string> = {
  "TOP": "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/svg/position-top.svg",
  "JGL": "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/svg/position-jungle.svg",
  "MID": "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/svg/position-middle.svg",
  "ADC": "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/svg/position-bottom.svg",
  "SUPP": "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/svg/position-utility.svg"
};

export function LaneSelector({ takenLanes, onSelect, disabled, t }: LaneSelectorProps) {
  const availableLanes = ALL_LANES.filter(lane => !takenLanes.includes(lane));

  if (availableLanes.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-3 py-4 border-t border-stone-800/30 w-full animate-in fade-in slide-in-from-bottom-2">
      <p className="text-xs font-bold uppercase text-stone-500 italic">{t.assignToLane}</p>
      <div className="flex flex-row gap-4 flex-wrap justify-center">
        {availableLanes.map(lane => (
          <div key={lane} className="flex flex-col items-center gap-1 group">
            <Button
              size="icon"
              disabled={disabled}
              className="h-12 w-12 rounded-full bg-stone-800 border-2 border-stone-700 hover:bg-stone-700 hover:border-emerald-500 hover:scale-110 transition-all cursor-pointer p-2 shadow-lg group-hover:shadow-emerald-500/20 relative overflow-hidden"
              onClick={() => onSelect(lane)}
              title={lane}
            >
              <img
                src={LANE_ICONS[lane]}
                alt={lane}
                className="w-full h-full opacity-70 group-hover:opacity-100 transition-opacity invert dark:invert-0"
              />
            </Button>
            <span className="text-[10px] font-bold text-stone-500 uppercase opacity-0 group-hover:opacity-100 transition-opacity transform -translate-y-2 group-hover:translate-y-0">
                {lane}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

