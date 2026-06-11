import { AppShell } from "@/components/AppShell";
import { JoinGroupForm } from "@/features/invite/JoinGroupForm";

type JoinPageProps = {
  searchParams: Promise<{
    code?: string;
  }>;
};

export default async function JoinPage({ searchParams }: JoinPageProps) {
  const { code } = await searchParams;

  return (
    <AppShell activeTab="profile">
      <div className="space-y-4">
        <header>
          <p className="text-xs font-black uppercase text-charcoal/55">Sibling Invite</p>
          <h1 className="text-3xl font-black">Join Showdown</h1>
        </header>
        <JoinGroupForm initialCode={code} />
      </div>
    </AppShell>
  );
}
