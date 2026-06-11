import { Calendar, Goal, Scale, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { MemberListCard } from "@/components/MemberListCard";
import { ProgressRaceCard } from "@/components/ProgressRaceCard";
import { PasswordSettingsForm } from "./PasswordSettingsForm";
import { ProfileEditForm } from "./ProfileEditForm";
import type { ProfileData } from "@/lib/data/contracts";
import { signOut } from "@/lib/supabase/actions/session";

type ProfileScreenProps = {
  profileData: ProfileData;
};

export function ProfileScreen({ profileData }: ProfileScreenProps) {
  const { competition, group, members, summary, user, weeklyTrend } = profileData;
  const hasTrendData = weeklyTrend.some((day) => day.you > 0 || day.sibling > 0);
  const unit = user.weightUnit;

  const settings = [
    { label: "Display Name", value: user.displayName, icon: UserRound },
    { label: "Group", value: group.name, icon: UserRound },
    { label: "Weight Unit", value: user.weightUnit.toUpperCase(), icon: Scale },
    { label: "Starting Weight", value: `${user.startingWeight} ${user.weightUnit}`, icon: Scale },
    { label: "Goal Weight", value: `${user.goalWeight} ${user.weightUnit}`, icon: Goal },
    { label: "Competition Dates", value: `${competition.startDate} to ${competition.endDate}`, icon: Calendar },
  ];

  return (
    <AppShell activeTab="profile">
      <div className="space-y-4">
        <header>
          <p className="text-xs font-black uppercase text-charcoal/55">Profile / Progress</p>
          <h1 className="text-3xl font-black">Your Showdown</h1>
        </header>

        <section className="doodle-card rounded-[1.5rem] bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="h-20 w-16 rounded-[48%_52%_45%_55%] border-2 border-charcoal bg-mint" />
            <div className="flex-1">
              <h2 className="text-xl font-black">{user.displayName}</h2>
              <p className="text-sm font-bold text-charcoal/60">Mascot: {user.avatar}</p>
              <p className="mt-1 text-xs font-black uppercase text-charcoal/55">{group.name}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
            <Link
              className="rounded-2xl border-2 border-charcoal bg-gold px-4 py-2 text-center text-sm font-black shadow-[0_3px_0_rgba(45,45,45,0.12)] transition active:translate-y-0.5"
              href="/invite"
            >
              Invite Sibling
            </Link>
            <a
              className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-charcoal bg-white shadow-[0_3px_0_rgba(45,45,45,0.12)] transition active:translate-y-0.5"
              href="#profile-settings"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Jump to settings</span>
            </a>
          </div>
        </section>

        <ProgressRaceCard summary={summary} />

        <section className="doodle-card rounded-[1.5rem] bg-white p-4">
          <h2 className="mb-4 text-sm font-black uppercase">Weekly Trend</h2>
          {hasTrendData ? (
            <div className="flex h-40 items-end gap-2 border-b-2 border-l-2 border-charcoal/30 px-2">
              {weeklyTrend.map((day) => (
                <div className="flex flex-1 flex-col items-center justify-end gap-1" key={day.label}>
                  <div className="flex h-28 items-end gap-1">
                    <span className="w-3 rounded-t bg-sage" style={{ height: `${Math.max(day.you * 24, 4)}px` }} />
                    <span className="w-3 rounded-t bg-coral" style={{ height: `${Math.max(day.sibling * 24, 4)}px` }} />
                  </div>
                  <span className="text-[10px] font-black">{day.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-charcoal/30 bg-cream px-4 py-6 text-center text-sm font-black">
              No weekly weigh-ins yet. Add a weight entry on the Log screen to start the trend.
            </div>
          )}
        </section>

        <div className="grid grid-cols-2 gap-3">
          <section className="doodle-card rounded-[1.25rem] bg-mint p-4">
            <h2 className="text-sm font-black uppercase">Your Week</h2>
            <p className="mt-2 text-3xl font-black">
              {summary.youWeightLost} {unit}
            </p>
            <p className="text-xs font-bold text-charcoal/65">{summary.youPercentLost}% from start</p>
          </section>
          <section className="doodle-card rounded-[1.25rem] bg-coral p-4">
            <h2 className="text-sm font-black uppercase">Today Winner</h2>
            <p className="mt-2 text-2xl font-black">{summary.dailyWinnerName}</p>
            <p className="text-xs font-bold text-charcoal/65">Consistency + meal bonus</p>
          </section>
        </div>

        <section className="doodle-card rounded-[1.5rem] bg-white p-4">
          <h2 className="mb-3 text-sm font-black uppercase">Winners</h2>
          <div className="grid gap-2 text-sm font-bold">
            <p className="rounded-2xl bg-blue px-3 py-2">
              Daily: <span className="font-black">{summary.dailyWinnerName}</span>
            </p>
            <p className="rounded-2xl bg-gold px-3 py-2">
              Weekly: <span className="font-black">{summary.weeklyWinnerName}</span>
            </p>
            <p className="rounded-2xl bg-mint px-3 py-2">
              Total: <span className="font-black">{summary.totalWinnerName}</span>
            </p>
          </div>
        </section>

        <MemberListCard members={members} />

        <details className="space-y-4" id="profile-settings">
          <summary className="doodle-card flex cursor-pointer list-none items-center justify-between rounded-[1.25rem] bg-white px-4 py-3 text-sm font-black transition active:translate-y-0.5 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </span>
            <span className="text-charcoal/50">Open</span>
          </summary>

          <div className="space-y-4 pt-2">
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

            <ProfileEditForm user={user} />
            <PasswordSettingsForm />

            <form action={signOut}>
              <button className="doodle-card w-full rounded-[1.25rem] bg-white px-4 py-3 text-sm font-black transition active:translate-y-0.5" type="submit">
                Sign Out
              </button>
            </form>
          </div>
        </details>
      </div>
    </AppShell>
  );
}
