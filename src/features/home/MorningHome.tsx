import { Scale } from "lucide-react";
import { CompetitionCountdownCard } from "@/components/CompetitionCountdownCard";
import { DoodleHeroCard } from "@/components/DoodleHeroCard";
import { HydrationTracker } from "@/components/HydrationTracker";
import { MealPhotoCard } from "@/components/MealPhotoCard";
import { ProgressRaceCard } from "@/components/ProgressRaceCard";
import { StatCard } from "@/components/StatCard";
import { TodayQuestCard } from "@/components/TodayQuestCard";
import { WorkoutGoalCard } from "@/components/WorkoutGoalCard";
import type { Competition, CompetitionSummary, DailyLog, User } from "@/lib/types";

type MorningHomeProps = {
  competition: Competition;
  isUploadingMealPhoto?: boolean;
  user: User;
  log: DailyLog;
  summary: CompetitionSummary;
  onLogChange?: (updates: Partial<DailyLog>) => void;
  onMealPhotoRemove?: () => void;
  onMealPhotoUpload?: (file: File) => void;
};

export function MorningHome({ competition, isUploadingMealPhoto, user, log, onLogChange, onMealPhotoRemove, onMealPhotoUpload, summary }: MorningHomeProps) {
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between pt-1">
        <div>
          <p className="text-xs font-black uppercase text-charcoal/55">Morning / Day</p>
          <h1 className="text-3xl font-black">Good morning!</h1>
        </div>
        <span className="rounded-full border-2 border-charcoal bg-gold px-3 py-1 text-sm font-black">AM</span>
      </header>

      <CompetitionCountdownCard competition={competition} />
      <DoodleHeroCard log={log} user={user} />
      <ProgressRaceCard summary={summary} />

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          accent="blue"
          detail="Saved from Log"
          icon={<Scale className="h-5 w-5" />}
          title="Weight"
          value={`${log.weight ?? user.currentWeight} ${user.weightUnit}`}
        />
        <HydrationTracker log={log} onWaterCupsChange={(waterCups) => onLogChange?.({ waterCups })} />
        <MealPhotoCard
          isUploading={isUploadingMealPhoto}
          log={log}
          onMealPhotoRemove={onMealPhotoRemove}
          onMealPhotoUpload={onMealPhotoUpload}
        />
        <WorkoutGoalCard log={log} />
      </div>

      <TodayQuestCard log={log} onQuestCompletedChange={(completed) => onLogChange?.({ completed })} />
    </div>
  );
}
