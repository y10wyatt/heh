import type { DailyLog, RivalAction, User } from "@/lib/types";

type DoodleHeroCardProps = {
  action?: RivalAction;
  log: DailyLog;
  user: User;
};

function getMascotMood(log: DailyLog) {
  if (log.completed) {
    return "Goal glow";
  }

  if (log.waterCups > 0 || log.workoutCompleted || log.mealPhotos.length > 0) {
    return "In progress";
  }

  return "Needs a nudge";
}

export function DoodleHeroCard({ action, log, user }: DoodleHeroCardProps) {
  const mood = getMascotMood(log);
  const platformWidth = Math.max(28, Math.min(100, (log.waterCups / log.waterGoal) * 100));

  return (
    <section className="doodle-card relative overflow-hidden rounded-[1.5rem] bg-blue p-4">
      <div className="absolute left-5 top-5 h-6 w-10 rounded-full border-2 border-charcoal bg-white/80" />
      <div className="absolute right-6 top-8 text-xl font-black text-gold">★</div>
      <div className="absolute right-14 top-4 text-lg font-black text-peach">♡</div>
      <div className="relative z-10 flex items-end gap-4">
        <div className="relative h-28 w-24 rounded-[48%_52%_45%_55%] border-2 border-charcoal bg-mint shadow-doodle">
          <span className="absolute left-6 top-10 h-2 w-2 rounded-full bg-charcoal" />
          <span className="absolute right-6 top-10 h-2 w-2 rounded-full bg-charcoal" />
          <span className={`absolute left-1/2 top-[3.75rem] h-3 w-6 -translate-x-1/2 ${log.completed ? "rounded-b-full border-b-4" : "rounded-t-full border-t-4"} border-charcoal`} />
          <span className="absolute -right-2 top-3 rounded-full bg-gold px-2 py-1 text-[10px] font-black">{mood}</span>
        </div>
        <div className="flex-1">
          <p className="text-xs font-black uppercase text-charcoal/60">{user.displayName}&apos;s jump board</p>
          <h2 className="text-xl font-black">Today&apos;s platform</h2>
          <div className="mt-3 h-5 overflow-hidden rounded-full border-2 border-charcoal bg-white">
            <div className="sketch-line h-full bg-sage" style={{ width: `${platformWidth}%` }} />
          </div>
          <p className="mt-2 text-xs font-bold text-charcoal/70">
            Water platform: {log.waterCups}/{log.waterGoal}. Workout: {log.workoutCompleted ? "landed" : "still jumping"}.
          </p>
          {action && action.id !== "no-action-yet" ? (
            <p className="mt-3 rounded-2xl border-2 border-charcoal bg-coral px-3 py-2 text-xs font-black">
              Rival effect: {action.type} - {action.reason}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
