"use client";

import { useActionState } from "react";
import { CalendarDays, Flag, Goal, Scale, Sparkles, Users } from "lucide-react";
import { completeOnboarding } from "@/lib/supabase/actions/onboarding";

const weekdays = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

const avatars = [
  { label: "Mint", value: "mint-blob", className: "bg-mint" },
  { label: "Peach", value: "peach-blob", className: "bg-coral" },
  { label: "Lavender", value: "lavender-blob", className: "bg-lavender" },
];

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(completeOnboarding, {});
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4">
      <section className="doodle-card rounded-[1.5rem] bg-white p-4">
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-2xl border-2 border-charcoal bg-mint p-3">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-black uppercase">Your Profile</h2>
            <p className="text-xs font-bold text-charcoal/60">You can edit this later.</p>
          </div>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">Display Name</span>
          <input className="w-full rounded-2xl border-2 border-charcoal bg-cream px-4 py-3 font-bold outline-none focus:bg-blue" name="displayName" required />
        </label>
        <div className="mt-4">
          <span className="mb-2 block text-xs font-black uppercase text-charcoal/60">Mascot</span>
          <div className="grid grid-cols-3 gap-2">
            {avatars.map((avatar) => (
              <label className="cursor-pointer rounded-2xl border-2 border-charcoal bg-white p-2 text-center text-xs font-black" key={avatar.value}>
                <input className="sr-only peer" defaultChecked={avatar.value === "mint-blob"} name="avatarId" type="radio" value={avatar.value} />
                <span className={`mx-auto mb-2 block h-12 w-10 rounded-[48%_52%_45%_55%] border-2 border-charcoal ${avatar.className} peer-checked:shadow-[0_0_0_4px_#FFEAA7]`} />
                {avatar.label}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="doodle-card rounded-[1.5rem] bg-white p-4">
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-2xl border-2 border-charcoal bg-blue p-3">
            <Scale className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-black uppercase">Weight Goals</h2>
            <p className="text-xs font-bold text-charcoal/60">Exact weight stays private.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">Starting</span>
            <input className="w-full rounded-2xl border-2 border-charcoal bg-cream px-3 py-3 font-bold outline-none focus:bg-blue" inputMode="decimal" name="startingWeight" step="0.1" type="number" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">Goal</span>
            <input className="w-full rounded-2xl border-2 border-charcoal bg-cream px-3 py-3 font-bold outline-none focus:bg-mint" inputMode="decimal" name="goalWeight" step="0.1" type="number" />
          </label>
        </div>
      </section>

      <section className="doodle-card rounded-[1.5rem] bg-white p-4">
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-2xl border-2 border-charcoal bg-coral p-3">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-black uppercase">Group</h2>
            <p className="text-xs font-bold text-charcoal/60">Starts with you, expandable later.</p>
          </div>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">Group Name</span>
          <input className="w-full rounded-2xl border-2 border-charcoal bg-cream px-4 py-3 font-bold outline-none focus:bg-coral" defaultValue="Sibling Showdown" name="groupName" required />
        </label>
      </section>

      <section className="doodle-card rounded-[1.5rem] bg-white p-4">
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-2xl border-2 border-charcoal bg-gold p-3">
            <Flag className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-black uppercase">Competition</h2>
            <p className="text-xs font-bold text-charcoal/60">Start day sets weekly weigh-in day.</p>
          </div>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">Competition Name</span>
          <input className="w-full rounded-2xl border-2 border-charcoal bg-cream px-4 py-3 font-bold outline-none focus:bg-gold" defaultValue="June Showdown" name="competitionName" required />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">Start</span>
            <input className="w-full rounded-2xl border-2 border-charcoal bg-cream px-3 py-3 font-bold outline-none focus:bg-gold" defaultValue={today} name="startDate" required type="date" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">End</span>
            <input className="w-full rounded-2xl border-2 border-charcoal bg-cream px-3 py-3 font-bold outline-none focus:bg-gold" name="endDate" required type="date" />
          </label>
        </div>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">Weekly Weigh-In Day</span>
          <select className="w-full rounded-2xl border-2 border-charcoal bg-cream px-3 py-3 font-bold outline-none focus:bg-gold" defaultValue="1" name="weeklyWeighInDay">
            {weekdays.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      {state.error ? <p className="rounded-2xl border-2 border-charcoal bg-coral px-4 py-3 text-sm font-black">{state.error}</p> : null}

      <button
        className="w-full rounded-2xl border-2 border-charcoal bg-peach px-4 py-4 text-sm font-black shadow-[0_4px_0_rgba(45,45,45,0.12)] transition active:translate-y-0.5 disabled:opacity-50"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Saving Setup..." : "Start Showdown"}
      </button>

      <p className="text-center text-xs font-bold text-charcoal/55">
        <CalendarDays className="mr-1 inline h-3 w-3" />
        Sister invites come next.
      </p>
    </form>
  );
}
