import { ProfileScreen } from "@/features/profile/ProfileScreen";
import { getProfilePageData } from "@/lib/data/supabase-read-model";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profileData = await getProfilePageData();

  return <ProfileScreen profileData={profileData} />;
}
