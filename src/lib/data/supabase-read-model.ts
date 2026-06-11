import { redirect } from "next/navigation";
import type { Competition, CompetitionSummary, DailyLog, Group, RivalAction, User, WeeklyTrendPoint } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase/database.types";
import { getDailyConsistencyScore, getPercentLost, getWeightLost, pickWinnerName } from "@/lib/competition/scoring";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type CompetitionRow = Database["public"]["Tables"]["competitions"]["Row"];
type DailyLogRow = Database["public"]["Tables"]["daily_logs"]["Row"];
type GroupRow = Database["public"]["Tables"]["groups"]["Row"];
type RivalActionRow = Database["public"]["Tables"]["rival_actions"]["Row"];
type WeightEntryRow = Database["public"]["Tables"]["weight_entries"]["Row"];

type AppContext = {
  competition: CompetitionRow;
  group: GroupRow;
  memberProfiles: ProfileRow[];
  latestWeights: Map<string, number>;
  userId: string;
  userProfile: ProfileRow;
};

function getLocalDate() {
  return new Date().toLocaleDateString("en-CA");
}

function toNumber(value: number | null | undefined) {
  return Number(value ?? 0);
}

function toUser(profile: ProfileRow, latestWeights: Map<string, number>): User {
  const startingWeight = toNumber(profile.starting_weight);

  return {
    id: profile.id,
    avatar: profile.avatar_id === "peach-blob" || profile.avatar_id === "lavender-blob" ? profile.avatar_id : "mint-blob",
    currentWeight: latestWeights.get(profile.id) ?? toNumber(profile.current_weight) ?? startingWeight,
    displayName: profile.display_name,
    goalWeight: toNumber(profile.goal_weight),
    name: profile.display_name,
    startingWeight,
  };
}

function createWaitingSibling(): User {
  return {
    id: "waiting-for-sibling",
    avatar: "peach-blob",
    currentWeight: 0,
    displayName: "Waiting for sibling",
    goalWeight: 0,
    name: "Waiting for sibling",
    startingWeight: 0,
  };
}

function toCompetition(row: CompetitionRow, user: User, sibling: User): Competition {
  return {
    id: row.id,
    endDate: row.end_date,
    groupId: row.group_id,
    progressType: "consistency-and-percent",
    startDate: row.start_date,
    userA: user,
    userB: sibling,
    waterGoal: row.water_goal,
    weeklyWeighInDay: row.weekly_weigh_in_day,
  };
}

function toGroup(row: GroupRow, memberProfiles: ProfileRow[]): Group {
  return {
    id: row.id,
    memberIds: memberProfiles.map((profile) => profile.id),
    name: row.name,
  };
}

function toDailyLog(row: DailyLogRow | null, userId: string, competition: CompetitionRow, weight: number | null): DailyLog {
  const today = getLocalDate();

  return {
    id: row?.id ?? `log-${userId}-${today}`,
    completed: row?.completed ?? false,
    customWorkoutMuscleGroups: row?.custom_workout_muscle_groups ?? [],
    date: row?.log_date ?? today,
    mealPhotoBonusEarned: row?.meal_photo_bonus_earned ?? false,
    mealPhotos: row && row.meal_photo_count > 0 ? ["/assets/meal-placeholder.svg"] : [],
    userId,
    waterCups: row?.water_cups ?? 0,
    waterGoal: row?.water_goal ?? competition.water_goal,
    weight,
    workoutCompleted: row?.workout_completed ?? false,
    workoutGoalMinutes: row?.workout_goal_minutes ?? 30,
    workoutMuscleGroups: row?.workout_muscle_groups?.length ? (row.workout_muscle_groups as DailyLog["workoutMuscleGroups"]) : ["full-body"],
  };
}

function toRivalAction(row: RivalActionRow | null, userId: string, sibling: User, competitionId: string): RivalAction {
  if (!row) {
    return {
      id: "no-action-yet",
      cosmeticOnly: true,
      date: getLocalDate(),
      fromUserId: userId,
      reason: "No rival action yet",
      toUserId: sibling.id,
      type: "nudge",
    };
  }

  const allowedTypes: Array<RivalAction["type"]> = ["nudge", "tease", "extra-challenge", "paint", "tomato"];

  return {
    id: row.id,
    cosmeticOnly: true,
    date: row.created_at.slice(0, 10),
    fromUserId: row.from_user_id,
    reason: row.reason || `Competition ${competitionId}`,
    toUserId: row.to_user_id,
    type: allowedTypes.includes(row.action_type as RivalAction["type"]) ? (row.action_type as RivalAction["type"]) : "nudge",
  };
}

function buildSummary(user: User, sibling: User, weeklyTrend: WeeklyTrendPoint[], userLog: DailyLog | null = null, siblingLog: DailyLog | null = null): CompetitionSummary {
  const youWeightLost = getWeightLost(user);
  const siblingWeightLost = getWeightLost(sibling);
  const youConsistencyScore = getDailyConsistencyScore(userLog);
  const siblingConsistencyScore = getDailyConsistencyScore(siblingLog);
  const youPercentLost = getPercentLost(user);
  const siblingPercentLost = getPercentLost(sibling);

  return {
    you: user,
    sibling,
    dailyWinnerName: pickWinnerName(user.displayName, youConsistencyScore, sibling.displayName, siblingConsistencyScore),
    leaderName: youWeightLost >= siblingWeightLost ? user.displayName : sibling.displayName,
    siblingConsistencyScore,
    siblingPercentLost,
    siblingWeightLost,
    totalWinnerName: pickWinnerName(user.displayName, youPercentLost, sibling.displayName, siblingPercentLost),
    weeklyTrend,
    weeklyWinnerName: pickWinnerName(user.displayName, youWeightLost + youConsistencyScore, sibling.displayName, siblingWeightLost + siblingConsistencyScore),
    youConsistencyScore,
    youPercentLost,
    youWeightLost,
  };
}

function buildWeeklyTrend(weightEntries: WeightEntryRow[], userId: string, siblingId: string): WeeklyTrendPoint[] {
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const isoDate = date.toLocaleDateString("en-CA");
    const youEntry = weightEntries.find((entry) => entry.user_id === userId && entry.entry_date === isoDate);
    const siblingEntry = weightEntries.find((entry) => entry.user_id === siblingId && entry.entry_date === isoDate);

    return {
      label: dayLabels[date.getDay()],
      sibling: siblingEntry ? Number(siblingEntry.weight) : 0,
      you: youEntry ? Number(youEntry.weight) : 0,
    };
  });
}

async function getAppContext(): Promise<AppContext> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  if (!userProfile) {
    redirect("/onboarding");
  }

  const { data: memberships } = await supabase.from("group_members").select("group_id").eq("user_id", user.id).limit(1);

  if (!memberships || memberships.length === 0) {
    redirect("/onboarding");
  }

  const groupId = memberships[0].group_id;
  const { data: group } = await supabase.from("groups").select("*").eq("id", groupId).single();
  const { data: competition } = await supabase
    .from("competitions")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!group || !competition) {
    redirect("/onboarding");
  }

  const { data: memberRows } = await supabase.from("group_members").select("user_id").eq("group_id", groupId);
  const memberIds = memberRows?.map((member) => member.user_id) ?? [user.id];
  const { data: memberProfiles } = await supabase.from("profiles").select("*").in("id", memberIds);
  const { data: weightEntries } = await supabase
    .from("weight_entries")
    .select("*")
    .eq("competition_id", competition.id)
    .in("user_id", memberIds)
    .order("entry_date", { ascending: false });
  const latestWeights = new Map<string, number>();

  weightEntries?.forEach((entry) => {
    if (!latestWeights.has(entry.user_id)) {
      latestWeights.set(entry.user_id, Number(entry.weight));
    }
  });

  return {
    competition,
    group,
    latestWeights,
    memberProfiles: memberProfiles ?? [userProfile],
    userId: user.id,
    userProfile,
  };
}

async function getPageModels() {
  const context = await getAppContext();
  const user = toUser(context.userProfile, context.latestWeights);
  const siblingProfile = context.memberProfiles.find((profile) => profile.id !== context.userId);
  const sibling = siblingProfile ? toUser(siblingProfile, context.latestWeights) : createWaitingSibling();
  const competition = toCompetition(context.competition, user, sibling);
  const group = toGroup(context.group, context.memberProfiles);

  return { competition, context, group, sibling, user };
}

export async function getHomePageData() {
  const supabase = await createSupabaseServerClient();
  const { competition, context, sibling, user } = await getPageModels();
  const today = getLocalDate();
  const { data: dailyLog } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("competition_id", competition.id)
    .eq("user_id", context.userId)
    .eq("log_date", today)
    .maybeSingle();
  const { data: weightEntry } = await supabase
    .from("weight_entries")
    .select("weight")
    .eq("competition_id", competition.id)
    .eq("user_id", context.userId)
    .eq("entry_date", today)
    .maybeSingle();
  const { data: latestRivalAction } = await supabase
    .from("rival_actions")
    .select("*")
    .eq("competition_id", competition.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { data: weeklyWeights } = await supabase
    .from("weight_entries")
    .select("*")
    .eq("competition_id", competition.id)
    .gte("entry_date", new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toLocaleDateString("en-CA"));
  const weeklyTrend = buildWeeklyTrend(weeklyWeights ?? [], user.id, sibling.id);
  const todayLog = toDailyLog(dailyLog, user.id, context.competition, weightEntry?.weight ?? null);
  const siblingDailyLog = null;

  return {
    latestRivalAction: toRivalAction(latestRivalAction, user.id, sibling, competition.id),
    sibling,
    summary: buildSummary(user, sibling, weeklyTrend, todayLog, siblingDailyLog),
    todayLog,
    user,
  };
}

export async function getLogPageData() {
  const supabase = await createSupabaseServerClient();
  const { competition, context, user } = await getPageModels();
  const today = getLocalDate();
  const { data: dailyLog } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("competition_id", competition.id)
    .eq("user_id", context.userId)
    .eq("log_date", today)
    .maybeSingle();
  const { data: weightEntry } = await supabase
    .from("weight_entries")
    .select("weight")
    .eq("competition_id", competition.id)
    .eq("user_id", context.userId)
    .eq("entry_date", today)
    .maybeSingle();

  return {
    todayLog: toDailyLog(dailyLog, user.id, context.competition, weightEntry?.weight ?? null),
    user,
  };
}

export async function getProgressPageData() {
  const supabase = await createSupabaseServerClient();
  const { competition, sibling, user } = await getPageModels();
  const { data: weeklyWeights } = await supabase
    .from("weight_entries")
    .select("*")
    .eq("competition_id", competition.id)
    .gte("entry_date", new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toLocaleDateString("en-CA"));
  const weeklyTrend = buildWeeklyTrend(weeklyWeights ?? [], user.id, sibling.id);

  return {
    competition,
    summary: buildSummary(user, sibling, weeklyTrend),
    weeklyTrend,
  };
}

export async function getProfilePageData() {
  const { competition, group, user } = await getPageModels();

  return {
    competition,
    group,
    user,
  };
}
