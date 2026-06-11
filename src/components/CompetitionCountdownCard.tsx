import { CalendarDays, Flag } from "lucide-react";
import type { Competition } from "@/lib/types";

type CompetitionCountdownCardProps = {
  competition: Competition;
};

function getDaysRemaining(endDate: string) {
  const today = new Date();
  const end = new Date(`${endDate}T23:59:59`);
  const millisecondsRemaining = end.getTime() - today.getTime();

  return Math.max(0, Math.ceil(millisecondsRemaining / 86_400_000));
}

export function CompetitionCountdownCard({ competition }: CompetitionCountdownCardProps) {
  const daysRemaining = getDaysRemaining(competition.endDate);

  return (
    <section className="doodle-card rounded-[1.5rem] bg-gold/80 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-charcoal/60">Competition Countdown</p>
          <h2 className="text-2xl font-black">{daysRemaining} days left</h2>
          <p className="text-xs font-bold text-charcoal/65">Ends {competition.endDate}</p>
        </div>
        <div className="grid h-16 w-16 place-items-center rounded-full border-2 border-charcoal bg-white">
          {daysRemaining > 0 ? <CalendarDays className="h-8 w-8" /> : <Flag className="h-8 w-8" />}
        </div>
      </div>
    </section>
  );
}
