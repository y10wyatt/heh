import { ProgressScreen } from "@/features/progress/ProgressScreen";
import { getProgressPageData } from "@/lib/data/supabase-read-model";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const progressData = await getProgressPageData();

  return <ProgressScreen progressData={progressData} />;
}
