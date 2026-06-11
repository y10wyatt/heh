import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { OnboardingForm } from "@/features/onboarding/OnboardingForm";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  const { data: memberships } = await supabase.from("group_members").select("group_id").eq("user_id", user.id).limit(1);

  if (profile && memberships && memberships.length > 0) {
    redirect("/");
  }

  return (
    <AppShell activeTab="profile">
      <div className="space-y-4">
        <header>
          <p className="text-xs font-black uppercase text-charcoal/55">First Setup</p>
          <h1 className="text-3xl font-black">Create Your Showdown</h1>
        </header>
        <OnboardingForm />
      </div>
    </AppShell>
  );
}
