import { CheckCircle2, Circle } from "lucide-react";
import type { DailyLog } from "@/lib/types";

type TodayQuestCardProps = {
  log: DailyLog;
  onQuestCompletedChange?: (completed: boolean) => void;
};

export function TodayQuestCard({ log, onQuestCompletedChange }: TodayQuestCardProps) {
  const Icon = log.completed ? CheckCircle2 : Circle;

  return (
    <section className={`doodle-card rounded-[1.5rem] p-4 ${log.completed ? "bg-mint" : "bg-gold/70"}`}>
      <button className="flex w-full items-center gap-3 text-left" onClick={() => onQuestCompletedChange?.(!log.completed)} type="button">
        <Icon className="h-7 w-7 shrink-0" />
        <div>
          <h2 className="text-sm font-black uppercase">Today&apos;s Quest</h2>
          <p className="text-sm font-bold text-charcoal/70">{log.completed ? "Quest complete" : "Tap when your daily plan is done."}</p>
        </div>
      </button>
    </section>
  );
}
