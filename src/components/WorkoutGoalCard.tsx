"use client";

import { Dumbbell } from "lucide-react";
import type { DailyLog } from "@/lib/types";

type WorkoutGoalCardProps = {
  log: DailyLog;
  onWorkoutCompletedChange?: (workoutCompleted: boolean) => void;
};

export function WorkoutGoalCard({ log, onWorkoutCompletedChange }: WorkoutGoalCardProps) {
  return (
    <article className="doodle-card rounded-[1.25rem] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase">Workout Goal</h3>
        <Dumbbell className="h-7 w-7" />
      </div>
      <p className="text-3xl font-black">
        {log.workoutGoalMinutes} <span className="text-sm">min</span>
      </p>
      <button
        className={`mt-4 w-full rounded-2xl border-2 border-charcoal px-3 py-2 text-center text-sm font-black transition active:translate-y-0.5 ${log.workoutCompleted ? "bg-mint" : "bg-white"}`}
        onClick={() => onWorkoutCompletedChange?.(!log.workoutCompleted)}
      >
        {log.workoutCompleted ? "Done" : "Mark Done"}
      </button>
    </article>
  );
}
