"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { updateProfile } from "@/lib/supabase/actions/profile";
import type { User } from "@/lib/types";

type ProfileEditFormProps = {
  user: User;
};

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, {});

  return (
    <form action={formAction} className="doodle-card rounded-[1.5rem] bg-white p-4">
      <h2 className="mb-4 text-sm font-black uppercase">Edit Profile</h2>
      <div className="grid gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">Display Name</span>
          <input className="w-full rounded-2xl border-2 border-charcoal bg-cream px-3 py-2 font-bold outline-none focus:bg-blue" defaultValue={user.displayName} name="displayName" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">Mascot</span>
          <select className="w-full rounded-2xl border-2 border-charcoal bg-cream px-3 py-2 font-bold outline-none focus:bg-mint" defaultValue={user.avatar} name="avatarId">
            <option value="mint-blob">Mint</option>
            <option value="peach-blob">Peach</option>
            <option value="lavender-blob">Lavender</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">Starting</span>
            <input className="w-full rounded-2xl border-2 border-charcoal bg-cream px-3 py-2 font-bold outline-none focus:bg-blue" defaultValue={user.startingWeight || ""} name="startingWeight" step="0.1" type="number" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">Goal</span>
            <input className="w-full rounded-2xl border-2 border-charcoal bg-cream px-3 py-2 font-bold outline-none focus:bg-mint" defaultValue={user.goalWeight || ""} name="goalWeight" step="0.1" type="number" />
          </label>
        </div>
      </div>
      {state.error ? <p className="mt-3 rounded-2xl bg-coral px-3 py-2 text-sm font-black">{state.error}</p> : null}
      {state.message ? <p className="mt-3 rounded-2xl bg-mint px-3 py-2 text-sm font-black">{state.message}</p> : null}
      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-charcoal bg-peach px-3 py-3 text-sm font-black shadow-[0_4px_0_rgba(45,45,45,0.12)]" disabled={isPending} type="submit">
        <Save className="h-4 w-4" />
        {isPending ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
