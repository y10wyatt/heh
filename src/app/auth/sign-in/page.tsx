import { AppShell } from "@/components/AppShell";
import { SignInForm } from "@/features/auth/SignInForm";

type SignInPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { next } = await searchParams;

  return (
    <AppShell activeTab="profile">
      <div className="space-y-4">
        <header>
          <p className="text-xs font-black uppercase text-charcoal/55">Private Access</p>
          <h1 className="text-3xl font-black">Sibling Showdown</h1>
        </header>
        <SignInForm nextPath={next ?? "/onboarding"} />
      </div>
    </AppShell>
  );
}
