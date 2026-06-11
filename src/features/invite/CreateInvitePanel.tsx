"use client";

import { useState } from "react";
import { Copy, Mail, Sparkles } from "lucide-react";
import { createGroupInvite } from "@/lib/supabase/actions/invites";

export function CreateInvitePanel() {
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateInvite() {
    const result = await createGroupInvite();

    setCode(result.code ?? null);
    setError(result.error ?? null);
  }

  const joinPath = code ? `/join?code=${code}` : null;

  return (
    <section className="doodle-card rounded-[1.5rem] bg-white p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-2xl border-2 border-charcoal bg-coral p-3">
          <Mail className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-black">Invite Sibling</h1>
          <p className="text-sm font-bold text-charcoal/60">Create a one-use code for your group.</p>
        </div>
      </div>

      <button
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-charcoal bg-peach px-4 py-3 text-sm font-black shadow-[0_4px_0_rgba(45,45,45,0.12)] transition active:translate-y-0.5"
        onClick={handleCreateInvite}
      >
        <Sparkles className="h-4 w-4" />
        Create Invite Code
      </button>

      {code ? (
        <div className="mt-4 rounded-2xl border-2 border-charcoal bg-gold p-4 text-center">
          <p className="text-xs font-black uppercase text-charcoal/60">Invite Code</p>
          <p className="text-4xl font-black tracking-[0.2em]">{code}</p>
          <p className="mt-2 break-all text-xs font-bold text-charcoal/70">{joinPath}</p>
          <button
            className="mt-3 inline-flex items-center gap-2 rounded-2xl border-2 border-charcoal bg-white px-4 py-2 text-xs font-black"
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}${joinPath}`)}
          >
            <Copy className="h-4 w-4" />
            Copy Link
          </button>
        </div>
      ) : null}

      {error ? <p className="mt-4 rounded-2xl border-2 border-charcoal bg-coral px-4 py-3 text-sm font-black">{error}</p> : null}
    </section>
  );
}
