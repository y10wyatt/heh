"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type InviteState = {
  code?: string;
  error?: string;
};

function createInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function createGroupInvite(): Promise<InviteState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in first." };
  }

  const { data: membership } = await supabase.from("group_members").select("group_id").eq("user_id", user.id).limit(1).maybeSingle();

  if (!membership) {
    return { error: "Finish onboarding before creating an invite." };
  }

  const { data: existingInvite } = await supabase
    .from("group_invites")
    .select("code")
    .eq("group_id", membership.group_id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingInvite?.code) {
    return { code: existingInvite.code };
  }

  const code = createInviteCode();
  const { error } = await supabase.from("group_invites").insert({
    code,
    created_by: user.id,
    group_id: membership.group_id,
  });

  return error ? { error: error.message } : { code };
}

export async function joinGroupWithInvite(_state: InviteState, formData: FormData): Promise<InviteState> {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const avatarId = String(formData.get("avatarId") ?? "peach-blob");

  if (!code) {
    return { error: "Enter an invite code." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/sign-in?next=/join?code=${encodeURIComponent(code)}`);
  }

  const { data: invite, error: inviteError } = await supabase
    .from("group_invites")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (inviteError || !invite) {
    return { error: "Invite code is invalid." };
  }

  const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();

  if (!existingProfile) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      avatar_id: avatarId,
      display_name: displayName || user.email || "Sibling",
    });

    if (profileError) {
      return { error: profileError.message };
    }
  }

  const { error: memberError } = await supabase.from("group_members").upsert({
    group_id: invite.group_id,
    role: "member",
    user_id: user.id,
  });

  if (memberError) {
    return { error: memberError.message };
  }

  redirect("/");
}
