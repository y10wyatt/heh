import { Flag } from "lucide-react";
import type { CompetitionSummary } from "@/lib/types";

type ProgressRaceCardProps = {
  summary: CompetitionSummary;
};

export function ProgressRaceCard({ summary }: ProgressRaceCardProps) {
  const total = Math.max(summary.youWeightLost + summary.siblingWeightLost, 1);
  const youPercent = Math.round((summary.youWeightLost / total) * 100);

  return (
    <section className="doodle-card rounded-[1.5rem] bg-white p-4">
      <div className="mb-4 text-center">
        <h2 className="text-sm font-black uppercase">Showdown Progress</h2>
        <p className="text-xs font-bold text-charcoal/60">Weight lost since competition start</p>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
        <div>
          <p className="text-xs font-bold">You</p>
          <p className="text-3xl font-black">{summary.youWeightLost}</p>
          <p className="text-xs font-bold">lbs down</p>
        </div>
        <div className="rounded-full border-2 border-charcoal bg-gold px-3 py-2 text-sm font-black">VS</div>
        <div>
          <p className="text-xs font-bold">Sibling</p>
          <p className="text-3xl font-black">{summary.siblingWeightLost}</p>
          <p className="text-xs font-bold">lbs down</p>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2">
        <div className="h-5 flex-1 overflow-hidden rounded-full border-2 border-charcoal bg-coral">
          <div className="sketch-line h-full bg-sage" style={{ width: `${youPercent}%` }} />
        </div>
        <Flag className="h-5 w-5 text-peach" fill="#FFBFA7" />
      </div>
      <p className="mt-2 text-center text-xs font-bold text-charcoal/65">Friendly lead: {summary.leaderName}</p>
    </section>
  );
}
