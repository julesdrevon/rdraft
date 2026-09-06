"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * A random champion splash sits behind everything, blurred and darkened enough
 * that white text stays readable over any artwork. It fades in on load rather
 * than snapping, so a slow CDN never causes a flash.
 */
export function SplashBackdrop({ src }: { src: string | null }) {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <div aria-hidden className="fixed inset-0 z-0 overflow-hidden bg-[#0a0908]">
      {src && (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority
          sizes="100vw"
          className={cn(
            "scale-105 object-cover blur-[6px] transition-opacity duration-1000 ease-out",
            loaded ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setLoaded(true)}
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(125% 95% at 50% 0%, rgba(10,9,8,0.52) 0%, rgba(10,9,8,0.84) 52%, rgba(10,9,8,0.97) 100%)",
        }}
      />
    </div>
  );
}
