"use client";

import { useState } from "react";
import { Mail, Sparkles, Zap } from "lucide-react";
import { sendRivalAction } from "@/lib/supabase/actions/rival-actions";
import type { RivalAction, User } from "@/lib/types";

type RivalActionCardProps = {
  action: RivalAction;
  target: User;
};

export function RivalActionCard({ action, target }: RivalActionCardProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(type: RivalAction["type"], message: string) {
    setError(null);
    setSelectedAction("Sending...");
    const result = await sendRivalAction(target.id, type, action.reason);

    if (result.error) {
      setError(result.error);
      setSelectedAction(null);
      return;
    }

    setSelectedAction(message);
  }

  return (
    <section className="doodle-card relative overflow-hidden rounded-[1.5rem] bg-white p-4">
      <span className="absolute right-4 top-3 rotate-12 rounded-sm bg-gold px-5 py-2 opacity-80" />
      <div className="flex gap-4">
        <div className="relative mt-6 h-24 w-20 rounded-[48%_52%_45%_55%] border-2 border-charcoal bg-coral">
          <span className="absolute left-5 top-9 h-2 w-2 rounded-full bg-charcoal" />
          <span className="absolute right-5 top-9 h-2 w-2 rounded-full bg-charcoal" />
          <span className="absolute left-7 top-14 h-3 w-6 rounded-t-full border-t-4 border-charcoal" />
          <span className="absolute -left-2 top-1 text-xl">☁</span>
        </div>
        <div className="flex-1">
          <p className="text-xs font-black uppercase tracking-normal">{target.name} missed their goal</p>
          <h2 className="mt-1 text-lg font-black">{action.reason}</h2>
          <div className="mt-4 grid gap-2">
            <button
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-charcoal bg-peach px-3 py-2 text-sm font-black shadow-[0_3px_0_rgba(45,45,45,0.12)] transition active:translate-y-0.5"
              onClick={() => handleAction("tease", "Tease sent")}
            >
              <Zap className="h-4 w-4" />
              Tease Them
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-charcoal bg-white px-3 py-2 text-sm font-black transition active:translate-y-0.5"
              onClick={() => handleAction("nudge", "Nudge sent")}
            >
              <Mail className="h-4 w-4" />
              Send a Nudge
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-charcoal bg-mint px-3 py-2 text-sm font-black transition active:translate-y-0.5"
              onClick={() => handleAction("extra-challenge", "Tiny challenge sent")}
            >
              <Sparkles className="h-4 w-4" />
              Tiny Challenge
            </button>
          </div>
          {selectedAction ? <p className="mt-3 rounded-2xl bg-gold px-3 py-2 text-center text-xs font-black">{selectedAction}</p> : null}
          {error ? <p className="mt-3 rounded-2xl bg-coral px-3 py-2 text-center text-xs font-black">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}
