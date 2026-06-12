"use client";

import { Camera, CheckCircle2, Dumbbell, Droplet, ImagePlus, PlusCircle, Scale, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getWeeklyWeighInMessage } from "@/lib/competition/weekly";
import type { DailyLog, MuscleGroup, WeightUnit } from "@/lib/types";
import { usePersistentDailyLog } from "@/lib/use-persistent-daily-log";

const muscleGroupOptions: Array<{ label: string; value: MuscleGroup }> = [
  { label: "Full Body", value: "full-body" },
  { label: "Upper Body", value: "upper-body" },
  { label: "Lower Body", value: "lower-body" },
  { label: "Arms", value: "arms" },
  { label: "Shoulders", value: "shoulders" },
  { label: "Core", value: "core" },
  { label: "Cardio", value: "cardio" },
  { label: "Custom", value: "custom" },
];

type LogScreenProps = {
  seedLog: DailyLog;
  weightUnit: WeightUnit;
  weeklyWeighInDay: number;
};

export function LogScreen({ seedLog, weeklyWeighInDay, weightUnit }: LogScreenProps) {
  const { addWorkoutLog, isUploadingMealPhoto, log, removeMealPhotos, statusMessage, updateLog, uploadMealPhoto } = usePersistentDailyLog(seedLog);
  const hasMealPhoto = log.mealPhotos.length > 0;
  const weightInputRef = useRef<HTMLInputElement>(null);
  const workoutMinutesRef = useRef<HTMLInputElement>(null);
  const [weightStatus, setWeightStatus] = useState<string | null>(null);
  const [workoutGroup, setWorkoutGroup] = useState<MuscleGroup>(log.workoutMuscleGroups[0] ?? "full-body");
  const [customWorkoutGroup, setCustomWorkoutGroup] = useState(log.customWorkoutMuscleGroups[0] ?? "");
  const [workoutStatus, setWorkoutStatus] = useState<string | null>(null);
  const weightConfirmation = weightStatus ?? (log.weight ? "Weight saved for today." : "No weight saved yet today.");
  const workoutConfirmation = workoutStatus ?? (log.workoutLogs.length ? `${log.workoutLogs.length} workout saved today.` : "No workouts logged yet today.");

  function saveWeight() {
    const inputValue = weightInputRef.current?.value ?? "";
    const nextWeight = inputValue ? Number(inputValue) : null;
    updateLog({ weight: nextWeight });
    setWeightStatus(nextWeight ? `Saved ${nextWeight} ${weightUnit} for today.` : "Weight cleared for today.");
  }

  async function saveWorkout() {
    const durationValue = workoutMinutesRef.current?.value ?? "";
    const durationMinutes = durationValue ? Number(durationValue) : null;
    const saved = await addWorkoutLog({
      customMuscleGroups: workoutGroup === "custom" && customWorkoutGroup ? [customWorkoutGroup] : [],
      durationMinutes,
      muscleGroups: [workoutGroup],
    });

    if (saved) {
      setWorkoutStatus("Workout added to today's log.");
    }
  }

  return (
    <AppShell activeTab="log">
      <div className="space-y-4">
        <header>
          <p className="text-xs font-black uppercase text-charcoal/55">Quick Input</p>
          <h1 className="text-3xl font-black">Daily Log</h1>
        </header>

        <section className="doodle-card rounded-[1.5rem] bg-white p-4">
          <label className="flex items-center gap-4">
            <span className="rounded-2xl border-2 border-charcoal bg-blue p-3">
              <Scale className="h-6 w-6" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-black uppercase">Weight</span>
              <span className="block text-xs font-bold text-charcoal/60">Today&apos;s weigh-in ({weightUnit})</span>
            </span>
            <input
              className="w-24 rounded-2xl border-2 border-charcoal bg-cream px-3 py-2 text-right text-base font-black outline-none focus:bg-blue"
              defaultValue={log.weight ?? ""}
              inputMode="decimal"
              key={`weight-${log.weight ?? "empty"}`}
              min="0"
              ref={weightInputRef}
              step="0.1"
              type="number"
            />
          </label>
          <button
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-charcoal bg-blue px-3 py-2 text-sm font-black transition active:translate-y-0.5"
            onClick={saveWeight}
            type="button"
          >
            <CheckCircle2 className="h-4 w-4" />
            Save Weight
          </button>
          <div className="mt-3 grid gap-2">
            <p className="rounded-2xl bg-mint px-3 py-2 text-xs font-black text-charcoal/70">{weightConfirmation}</p>
            <p className="rounded-2xl bg-blue px-3 py-2 text-xs font-black text-charcoal/70">
              {getWeeklyWeighInMessage(weeklyWeighInDay, Boolean(log.weight))}
            </p>
          </div>
        </section>

        <section className="doodle-card rounded-[1.5rem] bg-white p-4">
          <div className="mb-3 flex items-center gap-4">
            <span className="rounded-2xl border-2 border-charcoal bg-mint p-3">
              <Droplet className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <h2 className="text-sm font-black uppercase">Water</h2>
              <p className="text-xs font-bold text-charcoal/60">
                {log.waterCups} / {log.waterGoal} cups
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              className="rounded-2xl border-2 border-charcoal bg-white px-3 py-2 text-sm font-black transition active:translate-y-0.5"
              onClick={() => updateLog({ waterCups: Math.max(log.waterCups - 1, 0) })}
            >
              -1
            </button>
            <input
              className="rounded-2xl border-2 border-charcoal bg-cream px-3 py-2 text-center text-base font-black outline-none focus:bg-mint"
              inputMode="numeric"
              min="0"
              onChange={(event) => updateLog({ waterCups: Number(event.target.value) })}
              type="number"
              value={log.waterCups}
            />
            <button
              className="rounded-2xl border-2 border-charcoal bg-mint px-3 py-2 text-sm font-black transition active:translate-y-0.5"
              onClick={() => updateLog({ waterCups: Math.min(log.waterCups + 1, log.waterGoal) })}
            >
              +1
            </button>
          </div>
        </section>

        <section className="doodle-card rounded-[1.5rem] bg-white p-4">
          <div className="mb-3 flex items-center gap-4">
            <span className="rounded-2xl border-2 border-charcoal bg-coral p-3">
              <Camera className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <h2 className="text-sm font-black uppercase">Meal Photo</h2>
              <p className="text-xs font-bold text-charcoal/60">{hasMealPhoto ? `${log.mealPhotos.length} photo${log.mealPhotos.length === 1 ? "" : "s"} saved` : "No photo yet"}</p>
            </div>
          </div>
          {hasMealPhoto ? (
            <div className="mb-3 grid grid-cols-3 gap-2">
              {log.mealPhotos.map((photoUrl, index) => (
                <div className="aspect-square overflow-hidden rounded-2xl border-2 border-charcoal bg-mint" key={`${photoUrl}-${index}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={`Meal upload ${index + 1}`} className="h-full w-full object-cover" src={photoUrl} />
                </div>
              ))}
            </div>
          ) : null}
          <div className="grid gap-2">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-charcoal bg-coral px-3 py-3 text-sm font-black transition active:translate-y-0.5">
              <ImagePlus className="h-4 w-4" />
              {isUploadingMealPhoto ? "Uploading..." : "Upload Meal Photo"}
              <input
                accept="image/*"
                className="sr-only"
                disabled={isUploadingMealPhoto}
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    void uploadMealPhoto(file);
                  }

                  event.target.value = "";
                }}
                type="file"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-charcoal bg-blue px-3 py-3 text-sm font-black transition active:translate-y-0.5">
              <Camera className="h-4 w-4" />
              Take Photo
              <input
                accept="image/*"
                capture="environment"
                className="sr-only"
                disabled={isUploadingMealPhoto}
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    void uploadMealPhoto(file);
                  }

                  event.target.value = "";
                }}
                type="file"
              />
            </label>
            {hasMealPhoto ? (
              <button
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-charcoal bg-white px-3 py-3 text-sm font-black transition active:translate-y-0.5"
                onClick={() => void removeMealPhotos()}
              >
                <Trash2 className="h-4 w-4" />
                Remove Photo
              </button>
            ) : null}
          </div>
        </section>

        <section className="doodle-card rounded-[1.5rem] bg-white p-4">
          <div className="mb-3 flex items-center gap-4">
            <span className="rounded-2xl border-2 border-charcoal bg-gold p-3">
              <Dumbbell className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <h2 className="text-sm font-black uppercase">Workout</h2>
              <p className="text-xs font-bold text-charcoal/60">Add each workout you finish today</p>
            </div>
          </div>
          <div className="grid gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">Minutes</span>
            <input
              className="w-full rounded-2xl border-2 border-charcoal bg-cream px-3 py-2 text-base font-black outline-none focus:bg-gold"
              defaultValue={log.workoutGoalMinutes}
              inputMode="numeric"
              key={`workout-minutes-${log.workoutGoalMinutes}`}
              min="0"
              ref={workoutMinutesRef}
              type="number"
            />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">Muscle Group</span>
              <select
                className="w-full rounded-2xl border-2 border-charcoal bg-cream px-3 py-2 text-base font-black outline-none focus:bg-gold"
                onChange={(event) => setWorkoutGroup(event.target.value as MuscleGroup)}
                value={workoutGroup}
              >
                {muscleGroupOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {workoutGroup === "custom" ? (
              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">Custom Group</span>
                <input
                  className="w-full rounded-2xl border-2 border-charcoal bg-cream px-3 py-2 text-base font-black outline-none focus:bg-gold"
                  onChange={(event) => setCustomWorkoutGroup(event.target.value)}
                  placeholder="Example: back and biceps"
                  value={customWorkoutGroup}
                />
              </label>
            ) : null}
            <button
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-charcoal bg-gold px-3 py-3 text-sm font-black transition active:translate-y-0.5"
              onClick={() => void saveWorkout()}
              type="button"
            >
              <PlusCircle className="h-4 w-4" />
              Add Workout
            </button>
            <p className="rounded-2xl bg-mint px-3 py-2 text-xs font-black text-charcoal/70">{workoutConfirmation}</p>
            {log.workoutLogs.length > 0 ? (
              <div className="grid gap-2">
                {log.workoutLogs.map((entry) => (
                  <div className="rounded-2xl border-2 border-charcoal bg-cream px-3 py-2 text-sm font-bold" key={entry.id}>
                    <p className="font-black">
                      {entry.durationMinutes ?? 0} min · {entry.muscleGroups[0]?.replaceAll("-", " ") ?? "Workout"}
                    </p>
                    {entry.customMuscleGroups.length > 0 ? <p className="text-xs text-charcoal/60">{entry.customMuscleGroups.join(", ")}</p> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
        <p className="rounded-2xl bg-white px-4 py-3 text-xs font-black text-charcoal/65">{statusMessage}</p>
      </div>
    </AppShell>
  );
}
