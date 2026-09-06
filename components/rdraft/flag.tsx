import { cn } from "@/lib/utils";

/** `flag-icons` sprite, sized by the surrounding font-size. */
export function Flag({ code, className }: { code: string; className?: string }) {
  return <span aria-hidden className={cn(`fi fi-${code} rounded-[2px]`, className)} />;
}
