import { Camera, Check, Dumbbell, Droplet, Scale } from "lucide-react";
import type { DailyLog } from "@/lib/types";

type DailyRecapCardProps = {
  log: DailyLog;
};

export function DailyRecapCard({ log }: DailyRecapCardProps) {
  const rows = [
    { label: "Weight", value: log.weight ? `${log.weight} lbs` : "Optional today", done: true, icon: Scale },
    { label: "Hydration Goal", value: `${log.waterCups} / ${log.waterGoal} cups`, done: log.waterCups >= log.waterGoal, icon: Droplet },
    { label: "Meal Bonus", value: log.mealPhotos.length ? "Bonus earned" : "Optional", done: log.mealPhotos.length > 0, icon: Camera },
    { label: "Workout", value: log.workoutCompleted ? "Done" : `${log.workoutGoalMinutes} min planned`, done: log.workoutCompleted, icon: Dumbbell },
  ];

  return (
    <section className="doodle-card rounded-[1.5rem] bg-white p-4">
      <h2 className="mb-3 text-sm font-black uppercase">Today&apos;s Recap</h2>
      <div className="divide-y-2 divide-charcoal/10">
        {rows.map((row) => {
          const Icon = row.icon;

          return (
            <div className="flex items-center gap-3 py-3" key={row.label}>
              <div className="rounded-xl border-2 border-charcoal bg-blue p-2">
                <Icon className="h-5 w-5" />
              </div>
              <p className="flex-1 text-sm font-bold">{row.label}</p>
              <p className="text-sm font-black">{row.value}</p>
              <span className={`grid h-7 w-7 place-items-center rounded-full border-2 border-charcoal ${row.done ? "bg-sage" : "bg-coral"}`}>
                <Check className="h-4 w-4" />
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
