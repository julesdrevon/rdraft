import { LANE_ICONS } from "@/lib/ddragon/urls";
import type { Lane } from "@/lib/draft/types";
import { cn } from "@/lib/utils";

/**
 * The lane glyphs are masked rather than drawn as images, so they take their
 * colour from `currentColor` and can glow gold on hover like everything else.
 */
export function LaneIcon({ lane, className }: { lane: Lane; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("block bg-current", className)}
      style={{
        maskImage: `url(${LANE_ICONS[lane]})`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskImage: `url(${LANE_ICONS[lane]})`,
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
