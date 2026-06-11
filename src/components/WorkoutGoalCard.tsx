"use client";

import Link from "next/link";
import { Dumbbell, Pencil } from "lucide-react";
import type { DailyLog } from "@/lib/types";

type WorkoutGoalCardProps = {
  log: DailyLog;
};

export function WorkoutGoalCard({ log }: WorkoutGoalCardProps) {
  return (
    <article className="doodle-card rounded-[1.25rem] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase">Workout Goal</h3>
        <Dumbbell className="h-7 w-7" />
      </div>
      <p className="text-3xl font-black">
        {log.workoutGoalMinutes} <span className="text-sm">min</span>
      </p>
      <Link
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-charcoal bg-gold px-3 py-2 text-center text-sm font-black transition active:translate-y-0.5"
        href="/log"
      >
        <Pencil className="h-4 w-4" />
        Log Workout
      </Link>
    </article>
  );
}
