"use client";

import { EveningHome } from "./EveningHome";
import { MorningHome } from "./MorningHome";
import type { Competition, CompetitionSummary, DailyLog, RivalAction, User } from "@/lib/types";
import { usePersistentDailyLog } from "@/lib/use-persistent-daily-log";

type HomeClientProps = {
  action: RivalAction;
  competition: Competition;
  isEvening: boolean;
  seedLog: DailyLog;
  sibling: User;
  summary: CompetitionSummary;
  user: User;
};

export function HomeClient({ action, competition, isEvening, seedLog, sibling, summary, user }: HomeClientProps) {
  const { isUploadingMealPhoto, log, removeMealPhotos, updateLog, uploadMealPhoto } = usePersistentDailyLog(seedLog);

  if (isEvening) {
    return <EveningHome action={action} competition={competition} isUploadingMealPhoto={isUploadingMealPhoto} log={log} onLogChange={updateLog} onMealPhotoRemove={removeMealPhotos} onMealPhotoUpload={uploadMealPhoto} sibling={sibling} summary={summary} user={user} />;
  }

  return <MorningHome competition={competition} isUploadingMealPhoto={isUploadingMealPhoto} log={log} onLogChange={updateLog} onMealPhotoRemove={removeMealPhotos} onMealPhotoUpload={uploadMealPhoto} summary={summary} user={user} />;
}
