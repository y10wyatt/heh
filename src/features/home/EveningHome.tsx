import { CalendarDays, Dumbbell, Scale } from "lucide-react";
import { DailyRecapCard } from "@/components/DailyRecapCard";
import { DoodleHeroCard } from "@/components/DoodleHeroCard";
import { MascotBubble } from "@/components/MascotBubble";
import { ProgressRaceCard } from "@/components/ProgressRaceCard";
import { RivalActionCard } from "@/components/RivalActionCard";
import type { CompetitionSummary, DailyLog, RivalAction, User } from "@/lib/types";

type EveningHomeProps = {
  user: User;
  sibling: User;
  log: DailyLog;
  action: RivalAction;
  summary: CompetitionSummary;
};

export function EveningHome({ user, sibling, log, action, summary }: EveningHomeProps) {
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between pt-1">
        <div>
          <p className="text-xs font-black uppercase text-charcoal/55">Evening Review</p>
          <h1 className="text-3xl font-black">Good evening!</h1>
        </div>
        <span className="rounded-full border-2 border-charcoal bg-lavender px-3 py-1 text-sm font-black">PM</span>
      </header>

      <MascotBubble message="Nice work today. Let's review the scoreboard and set up tomorrow." mood="focused" user={user} />
      <DoodleHeroCard action={action} log={log} user={user} />
      <DailyRecapCard log={log} />
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
