"use client";

import { useState } from "react";
import { Mail, Sparkles } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type AuthMode = "magic-link" | "password";

type SignInFormProps = {
  nextPath?: string;
};

export function SignInForm({ nextPath = "/onboarding" }: SignInFormProps) {
  const [authMode, setAuthMode] = useState<AuthMode>("magic-link");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabaseReady = hasSupabaseEnv();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabaseReady) {
      setMessage("Supabase env vars are not configured yet. Add them before real sign-in.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const result =
      authMode === "magic-link"
        ? await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })
        : await supabase.auth.signInWithPassword({ email, password });

    setIsSubmitting(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (authMode === "password") {
      window.location.href = nextPath;
      return;
    }

    setMessage("Check your email for the magic link.");
  }

  async function handlePasswordSignUp() {
    if (!supabaseReady) {
      setMessage("Supabase env vars are not configured yet. Add them before creating accounts.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          onboarding_target: "/onboarding",
        },
      },
    });

    setIsSubmitting(false);
    setMessage(result.error ? result.error.message : "Account created. Check your email if confirmation is required.");
  }

  return (
    <section className="doodle-card rounded-[1.5rem] bg-white p-5">
      <div className="mb-5 flex items-center gap-3">
        <span className="rounded-2xl border-2 border-charcoal bg-mint p-3">
          <Sparkles className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-black">Sign in</h1>
          <p className="text-sm font-bold text-charcoal/60">Private sibling showdown access</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border-2 border-charcoal bg-cream p-1">
        <button
          className={`rounded-xl px-3 py-2 text-sm font-black ${authMode === "magic-link" ? "bg-blue" : "bg-transparent"}`}
          onClick={() => setAuthMode("magic-link")}
          type="button"
        >
          Magic Link
        </button>
        <button
          className={`rounded-xl px-3 py-2 text-sm font-black ${authMode === "password" ? "bg-coral" : "bg-transparent"}`}
          onClick={() => setAuthMode("password")}
          type="button"
        >
          Password
        </button>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">Email</span>
          <input
            className="w-full rounded-2xl border-2 border-charcoal bg-cream px-4 py-3 text-base font-bold outline-none focus:bg-blue"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </label>

        {authMode === "password" ? (
          <label className="block">
            <span className="mb-1 block text-xs font-black uppercase text-charcoal/60">Password</span>
            <input
              className="w-full rounded-2xl border-2 border-charcoal bg-cream px-4 py-3 text-base font-bold outline-none focus:bg-coral"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              required
              type="password"
              value={password}
            />
          </label>
        ) : null}

        <button
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-charcoal bg-peach px-4 py-3 text-sm font-black shadow-[0_4px_0_rgba(45,45,45,0.12)] transition active:translate-y-0.5 disabled:opacity-50"
          disabled={isSubmitting}
          type="submit"
        >
          <Mail className="h-4 w-4" />
          {authMode === "magic-link" ? "Send Magic Link" : "Sign In"}
        </button>

        {authMode === "password" ? (
          <button
            className="w-full rounded-2xl border-2 border-charcoal bg-white px-4 py-3 text-sm font-black transition active:translate-y-0.5 disabled:opacity-50"
            disabled={isSubmitting}
            onClick={handlePasswordSignUp}
            type="button"
          >
            Create Account
          </button>
        ) : null}
      </form>

      {message ? <p className="mt-4 rounded-2xl bg-gold px-4 py-3 text-sm font-black">{message}</p> : null}
    </section>
  );
}
