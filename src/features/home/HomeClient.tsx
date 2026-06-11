"use client";

import { useEffect, useState } from "react";
import { EveningHome } from "./EveningHome";
import { MorningHome } from "./MorningHome";
import { isEveningReviewTime } from "@/lib/time";
import type { Competition, CompetitionSummary, DailyLog, RivalAction, User } from "@/lib/types";
import { usePersistentDailyLog } from "@/lib/use-persistent-daily-log";

type HomeClientProps = {
  action: RivalAction;
  competition: Competition;
  seedLog: DailyLog;
  sibling: User;
  summary: CompetitionSummary;
  user: User;
};

export function HomeClient({ action, competition, seedLog, sibling, summary, user }: HomeClientProps) {
  const [isEvening, setIsEvening] = useState(false);
  const { isUploadingMealPhoto, log, removeMealPhotos, updateLog, uploadMealPhoto } = usePersistentDailyLog(seedLog);

  useEffect(() => {
    function syncLocalTimeMode() {
      setIsEvening(isEveningReviewTime(new Date()));
    }

    syncLocalTimeMode();
    const intervalId = window.setInterval(syncLocalTimeMode, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  if (isEvening) {
    return <EveningHome action={action} competition={competition} isUploadingMealPhoto={isUploadingMealPhoto} log={log} onLogChange={updateLog} onMealPhotoRemove={removeMealPhotos} onMealPhotoUpload={uploadMealPhoto} sibling={sibling} summary={summary} user={user} />;
  }

  return <MorningHome competition={competition} isUploadingMealPhoto={isUploadingMealPhoto} log={log} onLogChange={updateLog} onMealPhotoRemove={removeMealPhotos} onMealPhotoUpload={uploadMealPhoto} summary={summary} user={user} />;
}
