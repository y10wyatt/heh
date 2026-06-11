import { AppShell } from "@/components/AppShell";
import { HomeClient } from "@/features/home/HomeClient";
import { getHomePageData } from "@/lib/data/supabase-read-model";
import { isEveningReviewTime } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { latestRivalAction, sibling, summary, todayLog, user } = await getHomePageData();
  const isEvening = isEveningReviewTime();

  return (
    <AppShell activeTab="home">
      <HomeClient action={latestRivalAction} isEvening={isEvening} seedLog={todayLog} sibling={sibling} summary={summary} user={user} />
    </AppShell>
  );
}
