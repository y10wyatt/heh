"use client";

import { RotateCcw, Save } from "lucide-react";
import type { DailyLog } from "@/lib/types";
import { usePersistentDailyLog } from "@/lib/use-persistent-daily-log";

type SyncSettingsCardProps = {
  seedLog: DailyLog;
};

export function SyncSettingsCard({ seedLog }: SyncSettingsCardProps) {
  const { isLoading, log, resetLog, source, statusMessage } = usePersistentDailyLog(seedLog);

  return (
    <section className={`doodle-card rounded-[1.25rem] p-4 ${log.completed ? "bg-mint" : "bg-gold/70"}`}>
      <div className="flex items-center gap-3">
        <Save className="h-5 w-5" />
        <div>
          <h2 className="text-sm font-black uppercase">{log.completed ? "Daily log complete" : source === "supabase" ? "Supabase sync active" : "Local save active"}</h2>
          <p className="text-sm font-bold text-charcoal/70">{isLoading ? "Loading saved log..." : statusMessage}</p>
        </div>
      </div>
      <button
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-charcoal bg-white px-3 py-2 text-sm font-black transition active:translate-y-0.5"
        onClick={resetLog}
        type="button"
      >
        <RotateCcw className="h-4 w-4" />
        Reset Today
      </button>
    </section>
  );
}
