"use client";

import { useActionState } from "react";
import { Users } from "lucide-react";
import { joinGroupWithInvite } from "@/lib/supabase/actions/invites";

type JoinGroupFormProps = {
  initialCode?: string;
};

export function JoinGroupForm({ initialCode = "" }: JoinGroupFormProps) {
  const [state, formAction, isPending] = useActionState(joinGroupWithInvite, {});

  return (
    <form action={formAction} className="doodle-card rounded-[1.5rem] bg-white p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-2xl border-2 border-charcoal bg-mint p-3">
          <Users className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-black">Join Group</h1>
          <p className="text-sm font-bold text-charcoal/60">Use the code from your sibling.</p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">Invite Code</span>
          <input
            className="w-full rounded-2xl border-2 border-charcoal bg-cream px-4 py-3 text-base font-black uppercase outline-none focus:bg-gold"
            defaultValue={initialCode}
            name="code"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">Display Name</span>
          <input className="w-full rounded-2xl border-2 border-charcoal bg-cream px-4 py-3 text-base font-bold outline-none focus:bg-blue" name="displayName" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">Mascot</span>
          <select className="w-full rounded-2xl border-2 border-charcoal bg-cream px-4 py-3 text-base font-black outline-none focus:bg-mint" defaultValue="peach-blob" name="avatarId">
            <option value="peach-blob">Peach</option>
            <option value="mint-blob">Mint</option>
            <option value="lavender-blob">Lavender</option>
          </select>
        </label>
      </div>

      {state.error ? <p className="mt-4 rounded-2xl border-2 border-charcoal bg-coral px-4 py-3 text-sm font-black">{state.error}</p> : null}

      <button
        className="mt-4 w-full rounded-2xl border-2 border-charcoal bg-peach px-4 py-3 text-sm font-black shadow-[0_4px_0_rgba(45,45,45,0.12)] transition active:translate-y-0.5 disabled:opacity-50"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Joining..." : "Join Showdown"}
      </button>
    </form>
  );
}
