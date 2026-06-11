"use client";

import { Camera } from "lucide-react";
import type { DailyLog } from "@/lib/types";

type MealPhotoCardProps = {
  log: DailyLog;
  onMealPhotoChange?: (hasPhoto: boolean) => void;
};

export function MealPhotoCard({ log, onMealPhotoChange }: MealPhotoCardProps) {
  const hasPhoto = log.mealPhotos.length > 0;

  return (
    <article className="doodle-card rounded-[1.25rem] bg-white p-4">
      <h3 className="mb-3 text-sm font-black uppercase">Meal Photo</h3>
      <div className={`flex h-24 items-center justify-center rounded-2xl border-2 border-dashed border-charcoal/30 ${hasPhoto ? "bg-mint" : "bg-cream"}`}>
        <div className="text-center">
          <Camera className="mx-auto h-9 w-9" />
          {hasPhoto ? <p className="mt-1 text-xs font-black">Photo added</p> : null}
        </div>
      </div>
      <button
        className="mt-3 w-full rounded-2xl border-2 border-charcoal bg-coral px-3 py-2 text-sm font-black shadow-[0_3px_0_rgba(45,45,45,0.12)] transition active:translate-y-0.5"
        onClick={() => onMealPhotoChange?.(!hasPhoto)}
      >
        {hasPhoto ? "Remove Photo" : "Add Photo"}
      </button>
    </article>
  );
}
