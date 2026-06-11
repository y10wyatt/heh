"use client";

import { Camera, Dumbbell, Droplet, RotateCcw, Save, Scale } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getWeeklyWeighInMessage } from "@/lib/competition/weekly";
import type { DailyLog, MuscleGroup } from "@/lib/types";
import { usePersistentDailyLog } from "@/lib/use-persistent-daily-log";

const MEAL_PLACEHOLDER = "/assets/meal-placeholder.svg";
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
  weeklyWeighInDay: number;
};

export function LogScreen({ seedLog, weeklyWeighInDay }: LogScreenProps) {
  const { isLoading, log, resetLog, source, statusMessage, updateLog } = usePersistentDailyLog(seedLog);
  const hasMealPhoto = log.mealPhotos.length > 0;
  const selectedMuscleGroup = log.workoutMuscleGroups[0] ?? "full-body";

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
              <span className="block text-xs font-bold text-charcoal/60">Today&apos;s weigh-in</span>
            </span>
            <input
              className="w-24 rounded-2xl border-2 border-charcoal bg-cream px-3 py-2 text-right text-base font-black outline-none focus:bg-blue"
              inputMode="decimal"
              min="0"
              onChange={(event) => updateLog({ weight: event.target.value ? Number(event.target.value) : null })}
              step="0.1"
              type="number"
              value={log.weight ?? ""}
            />
          </label>
          <p className="mt-3 rounded-2xl bg-blue px-3 py-2 text-xs font-black text-charcoal/70">
            {getWeeklyWeighInMessage(weeklyWeighInDay, Boolean(log.weight))}
          </p>
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
              <p className="text-xs font-bold text-charcoal/60">{hasMealPhoto ? "Placeholder saved" : "No photo yet"}</p>
            </div>
          </div>
          <button
            className={`w-full rounded-2xl border-2 border-charcoal px-3 py-3 text-sm font-black transition active:translate-y-0.5 ${
              hasMealPhoto ? "bg-mint" : "bg-coral"
            }`}
            onClick={() => updateLog({ mealPhotos: hasMealPhoto ? [] : [MEAL_PLACEHOLDER] })}
          >
            {hasMealPhoto ? "Remove Placeholder Photo" : "Add Placeholder Photo"}
          </button>
        </section>

        <section className="doodle-card rounded-[1.5rem] bg-white p-4">
          <div className="mb-3 flex items-center gap-4">
            <span className="rounded-2xl border-2 border-charcoal bg-gold p-3">
              <Dumbbell className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <h2 className="text-sm font-black uppercase">Workout</h2>
              <p className="text-xs font-bold text-charcoal/60">Goal minutes, completion, and muscle group</p>
            </div>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <input
              className="rounded-2xl border-2 border-charcoal bg-cream px-3 py-2 text-base font-black outline-none focus:bg-gold"
              inputMode="numeric"
              min="0"
              onChange={(event) => updateLog({ workoutGoalMinutes: Number(event.target.value) })}
              type="number"
              value={log.workoutGoalMinutes}
            />
            <button
              className={`rounded-2xl border-2 border-charcoal px-4 py-2 text-sm font-black transition active:translate-y-0.5 ${
                log.workoutCompleted ? "bg-mint" : "bg-white"
              }`}
              onClick={() => updateLog({ workoutCompleted: !log.workoutCompleted })}
            >
              {log.workoutCompleted ? "Done" : "Mark Done"}
            </button>
          </div>
          <div className="mt-3 grid gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">Muscle Group</span>
              <select
                className="w-full rounded-2xl border-2 border-charcoal bg-cream px-3 py-2 text-base font-black outline-none focus:bg-gold"
                onChange={(event) => updateLog({ workoutMuscleGroups: [event.target.value as MuscleGroup] })}
                value={selectedMuscleGroup}
              >
                {muscleGroupOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {selectedMuscleGroup === "custom" ? (
              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">Custom Group</span>
                <input
                  className="w-full rounded-2xl border-2 border-charcoal bg-cream px-3 py-2 text-base font-black outline-none focus:bg-gold"
                  onChange={(event) =>
                    updateLog({
                      customWorkoutMuscleGroups: event.target.value ? [event.target.value] : [],
                    })
                  }
                  placeholder="Example: back and biceps"
                  value={log.customWorkoutMuscleGroups[0] ?? ""}
                />
              </label>
            ) : null}
          </div>
        </section>

        <section className={`doodle-card rounded-[1.5rem] p-4 ${log.completed ? "bg-mint" : "bg-gold/70"}`}>
          <div className="flex items-center gap-3">
            <Save className="h-5 w-5" />
            <div>
              <h2 className="text-sm font-black uppercase">{log.completed ? "Daily log complete" : source === "supabase" ? "Supabase sync active" : "Local save active"}</h2>
              <p className="text-sm font-bold text-charcoal/70">{isLoading ? "Loading saved log..." : statusMessage}</p>
            </div>
          </div>
          <button
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-charcoal bg-white px-3 py-2 text-sm font-black transition active:translate-y-0.5"
            onClick={resetLog}
          >
            <RotateCcw className="h-4 w-4" />
            Reset Today
          </button>
        </section>
      </div>
    </AppShell>
  );
}
