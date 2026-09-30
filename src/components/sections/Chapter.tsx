import type { ReactNode } from "react";
import type { ChapterId } from "@/lib/scroll/timeline";

/** Marks a run of content as one chapter of the 3D scroll story. */
export function Chapter({ id, children, className = "" }: { id: ChapterId; children: ReactNode; className?: string }) {
  return (
    <div data-chapter={id} className={`relative ${className}`}>
      {children}
    </div>
  );
}
