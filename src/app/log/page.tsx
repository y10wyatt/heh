import { LogScreen } from "@/features/log/LogScreen";
import { getLogPageData } from "@/lib/data/supabase-read-model";

export const dynamic = "force-dynamic";

export default async function LogPage() {
  const logData = await getLogPageData();

  return <LogScreen seedLog={logData.todayLog} />;
}
