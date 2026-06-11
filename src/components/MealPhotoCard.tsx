"use client";

import { Camera, ImagePlus, Trash2 } from "lucide-react";
import type { DailyLog } from "@/lib/types";

type MealPhotoCardProps = {
  isUploading?: boolean;
  log: DailyLog;
  onMealPhotoRemove?: () => void;
  onMealPhotoUpload?: (file: File) => void;
};

export function MealPhotoCard({ isUploading, log, onMealPhotoRemove, onMealPhotoUpload }: MealPhotoCardProps) {
  const hasPhoto = log.mealPhotos.length > 0;
  const photoUrl = log.mealPhotos[0];

  return (
    <article className="doodle-card rounded-[1.25rem] bg-white p-4">
      <h3 className="mb-3 text-sm font-black uppercase">Meal Photo</h3>
      <div className={`flex h-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-charcoal/30 ${hasPhoto ? "bg-mint" : "bg-cream"}`}>
        {hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="Meal upload preview" className="h-full w-full object-cover" src={photoUrl} />
        ) : (
          <div className="text-center">
            <Camera className="mx-auto h-9 w-9" />
            <p className="mt-1 text-xs font-black">Add a meal</p>
          </div>
        )}
      </div>
      <div className="mt-3 grid gap-2">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-charcoal bg-coral px-3 py-2 text-sm font-black shadow-[0_3px_0_rgba(45,45,45,0.12)] transition active:translate-y-0.5">
          <ImagePlus className="h-4 w-4" />
          {isUploading ? "Uploading..." : hasPhoto ? "Replace Photo" : "Upload Photo"}
          <input
            accept="image/*"
            className="sr-only"
            disabled={isUploading}
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                onMealPhotoUpload?.(file);
              }

              event.target.value = "";
            }}
            type="file"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-charcoal bg-blue px-3 py-2 text-sm font-black transition active:translate-y-0.5">
          <Camera className="h-4 w-4" />
          Take Photo
          <input
            accept="image/*"
            capture="environment"
            className="sr-only"
            disabled={isUploading}
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                onMealPhotoUpload?.(file);
              }

              event.target.value = "";
            }}
            type="file"
          />
        </label>
        {hasPhoto ? (
          <button
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-charcoal bg-white px-3 py-2 text-sm font-black transition active:translate-y-0.5"
            onClick={onMealPhotoRemove}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
            Remove Photo
          </button>
        ) : null}
      </div>
    </article>
  );
}
