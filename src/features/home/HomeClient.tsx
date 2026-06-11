"use client";

import { EveningHome } from "./EveningHome";
import { MorningHome } from "./MorningHome";
import type { CompetitionSummary, DailyLog, RivalAction, User } from "@/lib/types";
import { usePersistentDailyLog } from "@/lib/use-persistent-daily-log";

type HomeClientProps = {
  action: RivalAction;
  isEvening: boolean;
  seedLog: DailyLog;
  sibling: User;
  summary: CompetitionSummary;
  user: User;
};

export function HomeClient({ action, isEvening, seedLog, sibling, summary, user }: HomeClientProps) {
  const { log, updateLog } = usePersistentDailyLog(seedLog);

  if (isEvening) {
    return <EveningHome action={action} log={log} sibling={sibling} summary={summary} user={user} />;
  }

  return <MorningHome log={log} onLogChange={updateLog} summary={summary} user={user} />;
}
