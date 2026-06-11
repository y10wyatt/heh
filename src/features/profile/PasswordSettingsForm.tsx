"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export function PasswordSettingsForm() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });

    setIsSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setPassword("");
    setMessage("Password updated.");
  }

  return (
    <form className="doodle-card rounded-[1.5rem] bg-white p-4" onSubmit={handleSubmit}>
      <div className="mb-3 flex items-center gap-3">
        <span className="rounded-2xl border-2 border-charcoal bg-gold p-3">
          <KeyRound className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-sm font-black uppercase">Password</h2>
          <p className="text-xs font-bold text-charcoal/60">Set or change your sign-in password.</p>
        </div>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">New Password</span>
        <input
          className="w-full rounded-2xl border-2 border-charcoal bg-cream px-3 py-2 font-bold outline-none focus:bg-gold"
          minLength={6}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
          required
          type="password"
          value={password}
        />
      </label>
      {message ? <p className="mt-3 rounded-2xl bg-mint px-3 py-2 text-sm font-black">{message}</p> : null}
      <button
        className="mt-4 w-full rounded-2xl border-2 border-charcoal bg-peach px-3 py-3 text-sm font-black shadow-[0_4px_0_rgba(45,45,45,0.12)] disabled:opacity-50"
        disabled={isSaving}
        type="submit"
      >
        {isSaving ? "Saving..." : "Change Password"}
      </button>
    </form>
  );
}
