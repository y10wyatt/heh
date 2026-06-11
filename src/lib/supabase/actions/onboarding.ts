"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type OnboardingState = {
  error?: string;
};

function getRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing ${key}.`);
  }

  return value.trim();
}

function getOptionalNumber(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`${key} must be a positive number.`);
  }

  return parsed;
}

function getWeightUnit(formData: FormData) {
  const value = formData.get("weightUnit");

  return value === "kg" ? "kg" : "lb";
}

export async function completeOnboarding(_state: OnboardingState, formData: FormData): Promise<OnboardingState> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Please sign in before completing setup." };
    }

    const displayName = getRequiredString(formData, "displayName");
    const groupName = getRequiredString(formData, "groupName");
    const competitionName = getRequiredString(formData, "competitionName");
    const startDate = getRequiredString(formData, "startDate");
    const endDate = getRequiredString(formData, "endDate");
    const avatarId = getRequiredString(formData, "avatarId");
    const weightUnit = getWeightUnit(formData);
    const weeklyWeighInDay = Number(getRequiredString(formData, "weeklyWeighInDay"));
    const startingWeight = getOptionalNumber(formData, "startingWeight");
    const goalWeight = getOptionalNumber(formData, "goalWeight");

    if (Number.isNaN(weeklyWeighInDay) || weeklyWeighInDay < 0 || weeklyWeighInDay > 6) {
      return { error: "Weekly weigh-in day must be a valid weekday." };
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      avatar_id: avatarId,
      current_weight: startingWeight,
      display_name: displayName,
      goal_weight: goalWeight,
      starting_weight: startingWeight,
      weight_unit: weightUnit,
    });

    if (profileError) {
      return { error: profileError.message };
    }

    const groupId = crypto.randomUUID();

    const { error: groupError } = await supabase.from("groups").insert({
      id: groupId,
      created_by: user.id,
      name: groupName,
    });

    if (groupError) {
      return { error: groupError?.message ?? "Could not create group." };
    }

    const { error: memberError } = await supabase.from("group_members").insert({
      group_id: groupId,
      role: "owner",
      user_id: user.id,
    });

    if (memberError) {
      return { error: memberError.message };
    }

    const { error: competitionError } = await supabase.from("competitions").insert({
      end_date: endDate,
      group_id: groupId,
      name: competitionName,
      start_date: startDate,
      water_goal: 8,
      weekly_weigh_in_day: weeklyWeighInDay,
    });

    if (competitionError) {
      return { error: competitionError.message };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Setup failed." };
  }

  redirect("/");
}
