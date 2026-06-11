import { Calendar, Goal, Scale, UserRound } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { MemberListCard } from "@/components/MemberListCard";
import { ProfileEditForm } from "./ProfileEditForm";
import type { ProfileData } from "@/lib/data/contracts";
import { signOut } from "@/lib/supabase/actions/session";

type ProfileScreenProps = {
  profileData: ProfileData;
};

export function ProfileScreen({ profileData }: ProfileScreenProps) {
  const { competition, group, members, user } = profileData;

  const settings = [
    { label: "Display Name", value: user.displayName, icon: UserRound },
    { label: "Group", value: group.name, icon: UserRound },
    { label: "Starting Weight", value: `${user.startingWeight} lbs`, icon: Scale },
    { label: "Goal Weight", value: `${user.goalWeight} lbs`, icon: Goal },
    { label: "Competition Dates", value: `${competition.startDate} to ${competition.endDate}`, icon: Calendar },
  ];

  return (
    <AppShell activeTab="profile">
      <div className="space-y-4">
        <header>
          <p className="text-xs font-black uppercase text-charcoal/55">Profile / Settings</p>
          <h1 className="text-3xl font-black">Your Setup</h1>
        </header>

        <section className="doodle-card rounded-[1.5rem] bg-white p-5 text-center">
          <div className="mx-auto mb-3 h-24 w-20 rounded-[48%_52%_45%_55%] border-2 border-charcoal bg-mint" />
          <h2 className="text-xl font-black">{user.displayName}</h2>
          <p className="text-sm font-bold text-charcoal/60">Mascot: {user.avatar}</p>
          <Link
            className="mt-4 inline-block rounded-2xl border-2 border-charcoal bg-peach px-4 py-2 text-sm font-black shadow-[0_3px_0_rgba(45,45,45,0.12)] transition active:translate-y-0.5"
            href="/auth/sign-in"
          >
            Sign In Setup
          </Link>
          <Link
            className="ml-2 mt-4 inline-block rounded-2xl border-2 border-charcoal bg-mint px-4 py-2 text-sm font-black shadow-[0_3px_0_rgba(45,45,45,0.12)] transition active:translate-y-0.5"
            href="/onboarding"
          >
            Onboarding
          </Link>
          <Link
            className="mt-3 inline-block rounded-2xl border-2 border-charcoal bg-gold px-4 py-2 text-sm font-black shadow-[0_3px_0_rgba(45,45,45,0.12)] transition active:translate-y-0.5"
            href="/invite"
          >
            Invite Sibling
          </Link>
        </section>

        {settings.map((setting) => {
          const Icon = setting.icon;

          return (
            <section className="doodle-card flex items-center gap-4 rounded-[1.25rem] bg-white p-4" key={setting.label}>
              <div className="rounded-2xl border-2 border-charcoal bg-blue p-3">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase text-charcoal/55">{setting.label}</h2>
                <p className="text-base font-black">{setting.value}</p>
              </div>
            </section>
          );
        })}

        <MemberListCard members={members} />
        <ProfileEditForm user={user} />

        <form action={signOut}>
          <button className="doodle-card w-full rounded-[1.25rem] bg-white px-4 py-3 text-sm font-black transition active:translate-y-0.5" type="submit">
            Sign Out
          </button>
        </form>
      </div>
    </AppShell>
  );
}
