import { CalendarDays, Dumbbell, Scale } from "lucide-react";
import { CompetitionCountdownCard } from "@/components/CompetitionCountdownCard";
import { DailyRecapCard } from "@/components/DailyRecapCard";
import { DoodleHeroCard } from "@/components/DoodleHeroCard";
import { HydrationTracker } from "@/components/HydrationTracker";
import { MealPhotoCard } from "@/components/MealPhotoCard";
import { ProgressRaceCard } from "@/components/ProgressRaceCard";
import { RivalActionCard } from "@/components/RivalActionCard";
import { TodayQuestCard } from "@/components/TodayQuestCard";
import { WorkoutGoalCard } from "@/components/WorkoutGoalCard";
import type { Competition, CompetitionSummary, DailyLog, RivalAction, User } from "@/lib/types";

type EveningHomeProps = {
  competition: Competition;
  isUploadingMealPhoto?: boolean;
  user: User;
  sibling: User;
  log: DailyLog;
  action: RivalAction;
  summary: CompetitionSummary;
  onLogChange?: (updates: Partial<DailyLog>) => void;
  onMealPhotoRemove?: () => void;
  onMealPhotoUpload?: (file: File) => void;
};

export function EveningHome({ action, competition, isUploadingMealPhoto, log, onLogChange, onMealPhotoRemove, onMealPhotoUpload, sibling, summary, user }: EveningHomeProps) {
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between pt-1">
        <div>
          <p className="text-xs font-black uppercase text-charcoal/55">Evening Review</p>
          <h1 className="text-3xl font-black">Good evening!</h1>
        </div>
        <span className="rounded-full border-2 border-charcoal bg-lavender px-3 py-1 text-sm font-black">PM</span>
      </header>

      <CompetitionCountdownCard competition={competition} />
      <DoodleHeroCard action={action} log={log} user={user} />
      <TodayQuestCard log={log} onQuestCompletedChange={(completed) => onLogChange?.({ completed })} />
      <DailyRecapCard log={log} weightUnit={user.weightUnit} />

      <section className="doodle-card rounded-[1.5rem] bg-white p-4">
        <h2 className="mb-3 text-sm font-black uppercase">Still Need To Log?</h2>
        <div className="grid grid-cols-2 gap-3">
          <HydrationTracker log={log} onWaterCupsChange={(waterCups) => onLogChange?.({ waterCups })} />
          <WorkoutGoalCard log={log} />
          <MealPhotoCard isUploading={isUploadingMealPhoto} log={log} onMealPhotoRemove={onMealPhotoRemove} onMealPhotoUpload={onMealPhotoUpload} />
        </div>
      </section>

      <ProgressRaceCard summary={summary} />
      <RivalActionCard action={action} target={sibling} />

      <section className="doodle-card rounded-[1.5rem] bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          <h2 className="text-sm font-black uppercase">Tomorrow&apos;s Plan</h2>
        </div>
        <div className="grid grid-cols-3 divide-x-2 divide-dashed divide-charcoal/25 text-center">
          <div className="px-2">
            <Scale className="mx-auto mb-1 h-6 w-6" />
            <p className="text-xs font-black">Weigh In</p>
          </div>
          <div className="px-2">
            <p className="mb-1 text-xs font-black uppercase text-charcoal/60">Water</p>
            <p className="text-xs font-black">{log.waterGoal} Cups</p>
          </div>
          <div className="px-2">
            <Dumbbell className="mx-auto mb-1 h-6 w-6" />
            <p className="text-xs font-black">{log.workoutGoalMinutes} min</p>
          </div>
        </div>
      </section>
    </div>
  );
}
