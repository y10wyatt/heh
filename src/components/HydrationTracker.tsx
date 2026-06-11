"use client";

import { Droplet, Plus } from "lucide-react";
import type { DailyLog } from "@/lib/types";

type HydrationTrackerProps = {
  log: DailyLog;
  onWaterCupsChange?: (waterCups: number) => void;
};

export function HydrationTracker({ log, onWaterCupsChange }: HydrationTrackerProps) {
  const isComplete = log.waterCups >= log.waterGoal;

  return (
    <article className="doodle-card rounded-[1.25rem] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase">Hydration</h3>
        <button
          aria-label="Add water cup"
          className="rounded-full border-2 border-charcoal bg-white p-1 transition active:translate-y-0.5 disabled:opacity-40"
          disabled={isComplete}
          onClick={() => onWaterCupsChange?.(Math.min(log.waterCups + 1, log.waterGoal))}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: log.waterGoal }).map((_, index) => {
          const filled = index < log.waterCups;

          return (
            <Droplet
              aria-hidden="true"
              className={filled ? "h-7 w-7 text-blue" : "h-7 w-7 text-charcoal/25"}
              fill={filled ? "#CFE8FF" : "transparent"}
              key={index}
            />
          );
        })}
      </div>
      <p className="mt-3 text-xl font-black">
        {log.waterCups} / {log.waterGoal} <span className="text-sm">cups</span>
      </p>
      <button className="mt-2 text-xs font-black text-charcoal/55 underline" onClick={() => onWaterCupsChange?.(0)}>
        Reset
      </button>
    </article>
  );
}
