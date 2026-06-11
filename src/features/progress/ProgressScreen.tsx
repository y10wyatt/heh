import { AppShell } from "@/components/AppShell";
import { ProgressRaceCard } from "@/components/ProgressRaceCard";
import type { ProgressData } from "@/lib/data/contracts";

type ProgressScreenProps = {
  progressData: ProgressData;
};

export function ProgressScreen({ progressData }: ProgressScreenProps) {
  const { summary, weeklyTrend } = progressData;
  const hasTrendData = weeklyTrend.some((day) => day.you > 0 || day.sibling > 0);
  const unit = summary.you.weightUnit;

  return (
    <AppShell activeTab="profile">
      <div className="space-y-4">
        <header>
          <p className="text-xs font-black uppercase text-charcoal/55">Weekly Comparison</p>
          <h1 className="text-3xl font-black">You vs Sibling</h1>
        </header>

        <ProgressRaceCard summary={summary} />

        <section className="doodle-card rounded-[1.5rem] bg-white p-4">
          <h2 className="mb-4 text-sm font-black uppercase">Weekly Trend</h2>
          {hasTrendData ? (
            <div className="flex h-40 items-end gap-2 border-b-2 border-l-2 border-charcoal/30 px-2">
              {weeklyTrend.map((day) => (
                <div className="flex flex-1 flex-col items-center justify-end gap-1" key={day.label}>
                  <div className="flex h-28 items-end gap-1">
                    <span className="w-3 rounded-t bg-sage" style={{ height: `${Math.max(day.you * 24, 4)}px` }} />
                    <span className="w-3 rounded-t bg-coral" style={{ height: `${Math.max(day.sibling * 24, 4)}px` }} />
                  </div>
                  <span className="text-[10px] font-black">{day.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-charcoal/30 bg-cream px-4 py-6 text-center text-sm font-black">
              No weekly weigh-ins yet. Add a weight entry on the Log screen to start the trend.
            </div>
          )}
        </section>

        <div className="grid grid-cols-2 gap-3">
          <section className="doodle-card rounded-[1.25rem] bg-mint p-4">
            <h2 className="text-sm font-black uppercase">Your Week</h2>
            <p className="mt-2 text-3xl font-black">{summary.youWeightLost} {unit}</p>
            <p className="text-xs font-bold text-charcoal/65">{summary.youPercentLost}% from start</p>
          </section>
          <section className="doodle-card rounded-[1.25rem] bg-coral p-4">
            <h2 className="text-sm font-black uppercase">Today Winner</h2>
            <p className="mt-2 text-2xl font-black">{summary.dailyWinnerName}</p>
            <p className="text-xs font-bold text-charcoal/65">Consistency + meal bonus</p>
          </section>
        </div>

        <section className="doodle-card rounded-[1.5rem] bg-white p-4">
          <h2 className="mb-3 text-sm font-black uppercase">Winners</h2>
          <div className="grid gap-2 text-sm font-bold">
            <p className="rounded-2xl bg-blue px-3 py-2">Daily: <span className="font-black">{summary.dailyWinnerName}</span></p>
            <p className="rounded-2xl bg-gold px-3 py-2">Weekly: <span className="font-black">{summary.weeklyWinnerName}</span></p>
            <p className="rounded-2xl bg-mint px-3 py-2">Total: <span className="font-black">{summary.totalWinnerName}</span></p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
