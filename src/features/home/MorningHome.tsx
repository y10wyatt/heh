import { Dumbbell, Scale } from "lucide-react";
import { DoodleHeroCard } from "@/components/DoodleHeroCard";
import { HydrationTracker } from "@/components/HydrationTracker";
import { MascotBubble } from "@/components/MascotBubble";
import { MealPhotoCard } from "@/components/MealPhotoCard";
import { ProgressRaceCard } from "@/components/ProgressRaceCard";
import { StatCard } from "@/components/StatCard";
import { WorkoutGoalCard } from "@/components/WorkoutGoalCard";
import type { CompetitionSummary, DailyLog, User } from "@/lib/types";

type MorningHomeProps = {
  user: User;
  log: DailyLog;
  summary: CompetitionSummary;
  onLogChange?: (updates: Partial<DailyLog>) => void;
};

export function MorningHome({ user, log, onLogChange, summary }: MorningHomeProps) {
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between pt-1">
        <div>
          <p className="text-xs font-black uppercase text-charcoal/55">Morning / Day</p>
          <h1 className="text-3xl font-black">Good morning!</h1>
        </div>
        <span className="rounded-full border-2 border-charcoal bg-gold px-3 py-1 text-sm font-black">AM</span>
      </header>

      <MascotBubble message="Let's plan the day, log the basics, and keep that sibling lead cute." user={user} />
      <DoodleHeroCard log={log} user={user} />
      <ProgressRaceCard summary={summary} />

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          accent="blue"
          detail="Saved from Log"
          icon={<Scale className="h-5 w-5" />}
          title="Weight"
          value={`${log.weight ?? user.currentWeight} lbs`}
        />
        <HydrationTracker log={log} onWaterCupsChange={(waterCups) => onLogChange?.({ waterCups })} />
        <MealPhotoCard
          log={log}
          onMealPhotoChange={(hasPhoto) => onLogChange?.({ mealPhotos: hasPhoto ? ["/assets/meal-placeholder.svg"] : [] })}
        />
        <WorkoutGoalCard log={log} onWorkoutCompletedChange={(workoutCompleted) => onLogChange?.({ workoutCompleted })} />
      </div>

      <section className="doodle-card rounded-[1.5rem] bg-gold/70 p-4">
        <div className="flex items-center gap-3">
          <Dumbbell className="h-6 w-6" />
          <div>
            <h2 className="text-sm font-black uppercase">Today&apos;s Tiny Quest</h2>
            <p className="text-sm font-bold text-charcoal/70">Finish {log.workoutGoalMinutes} minutes before evening review.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
