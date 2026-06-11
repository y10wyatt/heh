"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { RivalAction } from "@/lib/types";

type RivalActionState = {
  message?: string;
  error?: string;
};

export async function sendRivalAction(toUserId: string, actionType: RivalAction["type"], reason: string): Promise<RivalActionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in first." };
  }

  const { data: membership } = await supabase.from("group_members").select("group_id").eq("user_id", user.id).limit(1).maybeSingle();

  if (!membership) {
    return { error: "Finish onboarding first." };
  }

  const { data: competition } = await supabase
    .from("competitions")
    .select("id")
    .eq("group_id", membership.group_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!competition) {
    return { error: "Create a competition first." };
  }

  const { error } = await supabase.from("rival_actions").insert({
    action_type: actionType,
    competition_id: competition.id,
    cosmetic_only: true,
    from_user_id: user.id,
    reason,
    to_user_id: toUserId,
  });

  if (error) {
    return { error: error.message };
  }

  return { message: "Cosmetic action sent." };
}
