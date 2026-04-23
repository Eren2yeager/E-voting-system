"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import DotField from "@/components/ui/DotField";

export function AppDotFieldBackground({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-dvh">
      <div className="pointer-events-none fixed inset-0 z-0">
        <DotField
          dotRadius={2}
          dotSpacing={14}
          bulgeStrength={67}
          glowRadius={160}
          sparkle={false}
          waveAmplitude={0}
          cursorRadius={500}
          cursorForce={0.1}
          bulgeOnly
          gradientFrom="#a318d6"
          gradientTo="#a159b3"
          glowColor="#120F17"
        />
      </div>
      <div
        className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-b from-background/84 via-background/72 to-background/86 dark:from-background/88 dark:via-background/76 dark:to-background/90"
        aria-hidden
      />
      <div className="relative z-10 min-h-dvh">{children}</div>
    </div>
  );
}
