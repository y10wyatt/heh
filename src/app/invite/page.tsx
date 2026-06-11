import { AppShell } from "@/components/AppShell";
import { CreateInvitePanel } from "@/features/invite/CreateInvitePanel";
import { getProfilePageData } from "@/lib/data/supabase-read-model";

export const dynamic = "force-dynamic";

export default async function InvitePage() {
  await getProfilePageData();

  return (
    <AppShell activeTab="profile">
      <div className="space-y-4">
        <header>
          <p className="text-xs font-black uppercase text-charcoal/55">Group Access</p>
          <h1 className="text-3xl font-black">Invite</h1>
        </header>
        <CreateInvitePanel />
      </div>
    </AppShell>
  );
}
