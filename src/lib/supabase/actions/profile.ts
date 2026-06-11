"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type ProfileState = {
  error?: string;
  message?: string;
};

function getOptionalNumber(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function getWeightUnit(formData: FormData) {
  const value = formData.get("weightUnit");

  return value === "kg" ? "kg" : "lb";
}

export async function updateProfile(_state: ProfileState, formData: FormData): Promise<ProfileState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in first." };
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  const avatarId = String(formData.get("avatarId") ?? "mint-blob");
  const weightUnit = getWeightUnit(formData);

  if (!displayName) {
    return { error: "Display name is required." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      avatar_id: avatarId,
      display_name: displayName,
      goal_weight: getOptionalNumber(formData, "goalWeight"),
      starting_weight: getOptionalNumber(formData, "startingWeight"),
      weight_unit: weightUnit,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/");

  return { message: "Profile saved." };
}
