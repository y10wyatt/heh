"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "./supabase/browser-client";
import { hasSupabaseEnv } from "./supabase/env";
import type { DailyLog, MuscleGroup, WorkoutLogEntry } from "./types";
import { normalizeDailyLog } from "./use-daily-log";

type PersistenceSource = "loading" | "supabase" | "local";

type SupabaseContext = {
  userId: string;
  competitionId: string;
};

const STORAGE_PREFIX = "sibling-showdown:daily-log";

function getLocalDate() {
  return new Date().toLocaleDateString("en-CA");
}

function getStorageKey(log: DailyLog) {
  return `${STORAGE_PREFIX}:${log.userId}:${log.date}`;
}

function readLocalLog(seedLog: DailyLog) {
  const savedLog = window.localStorage.getItem(getStorageKey(seedLog));
  return savedLog ? normalizeDailyLog(JSON.parse(savedLog) as DailyLog) : normalizeDailyLog(seedLog);
}

function toSupabaseDailyLog(log: DailyLog, context: SupabaseContext) {
  return {
    id: log.id.startsWith("log-") ? undefined : log.id,
    competition_id: context.competitionId,
    completed: log.completed,
    custom_workout_muscle_groups: log.customWorkoutMuscleGroups,
    log_date: log.date,
    meal_photo_bonus_earned: log.mealPhotoBonusEarned,
    meal_photo_count: Math.max(log.mealPhotos.length, log.mealPhotoPaths.length),
    user_id: context.userId,
    water_cups: log.waterCups,
    water_goal: log.waterGoal,
    workout_completed: log.workoutCompleted,
    workout_goal_minutes: log.workoutGoalMinutes,
    workout_muscle_groups: log.workoutMuscleGroups,
  };
}

async function createSignedMealPhotoUrls(paths: string[]) {
  const supabase = createSupabaseBrowserClient();
  const signedUrls = await Promise.all(
    paths.map(async (path) => {
      const { data } = await supabase.storage.from("meal-photos").createSignedUrl(path, 60 * 60);
      return data?.signedUrl ?? null;
    }),
  );

  return signedUrls.filter((url): url is string => Boolean(url));
}

function toWorkoutLogEntry(row: {
  id: string;
  completed: boolean;
  duration_minutes: number | null;
  muscle_groups: string[];
  custom_muscle_groups: string[];
  created_at: string;
}): WorkoutLogEntry {
  return {
    id: row.id,
    completed: row.completed,
    createdAt: row.created_at,
    customMuscleGroups: row.custom_muscle_groups ?? [],
    durationMinutes: row.duration_minutes,
    muscleGroups: (row.muscle_groups ?? []) as MuscleGroup[],
  };
}

export function usePersistentDailyLog(seedLog: DailyLog) {
  const [log, setLog] = useState(() => normalizeDailyLog({ ...seedLog, date: getLocalDate() }));
  const [isUploadingMealPhoto, setIsUploadingMealPhoto] = useState(false);
  const [source, setSource] = useState<PersistenceSource>("loading");
  const [statusMessage, setStatusMessage] = useState("Checking signed-in storage...");
  const [context, setContext] = useState<SupabaseContext | null>(null);
  const storageKey = useMemo(() => getStorageKey(log), [log]);

  useEffect(() => {
    let isCancelled = false;

    async function loadLog() {
      if (!hasSupabaseEnv()) {
        if (!isCancelled) {
          setLog(readLocalLog(seedLog));
          setSource("local");
          setStatusMessage("Saved on this device.");
        }
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!isCancelled) {
          setLog(readLocalLog(seedLog));
          setSource("local");
          setStatusMessage("Sign in to sync with Supabase.");
        }
        return;
      }

      const { data: memberships, error: membershipError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id)
        .limit(1);

      if (membershipError || !memberships || memberships.length === 0) {
        if (!isCancelled) {
          setLog(normalizeDailyLog({ ...seedLog, userId: user.id, date: getLocalDate() }));
          setSource("local");
          setStatusMessage("Finish onboarding before Supabase logging is enabled.");
        }
        return;
      }

      const { data: competitions, error: competitionError } = await supabase
        .from("competitions")
        .select("id, water_goal")
        .eq("group_id", memberships[0].group_id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (competitionError || !competitions || competitions.length === 0) {
        if (!isCancelled) {
          setLog(normalizeDailyLog({ ...seedLog, userId: user.id, date: getLocalDate() }));
          setSource("local");
          setStatusMessage("Create a competition before Supabase logging is enabled.");
        }
        return;
      }

      const nextContext = { competitionId: competitions[0].id, userId: user.id };
      const today = getLocalDate();
      const { data: dailyLog } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("competition_id", nextContext.competitionId)
        .eq("user_id", user.id)
        .eq("log_date", today)
        .maybeSingle();
      const { data: weightEntry } = await supabase
        .from("weight_entries")
        .select("weight")
        .eq("competition_id", nextContext.competitionId)
        .eq("user_id", user.id)
        .eq("entry_date", today)
        .maybeSingle();
      const { data: mealLogs } = dailyLog
        ? await supabase.from("meal_logs").select("photo_url").eq("daily_log_id", dailyLog.id).eq("user_id", user.id).order("created_at", { ascending: false })
        : { data: null };
      const { data: workoutLogs } = dailyLog
        ? await supabase
            .from("workout_logs")
            .select("id, completed, duration_minutes, muscle_groups, custom_muscle_groups, created_at")
            .eq("daily_log_id", dailyLog.id)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
        : { data: null };
      const mealPhotoPaths = mealLogs?.map((mealLog) => mealLog.photo_url).filter((path): path is string => Boolean(path)) ?? [];
      const mealPhotos = await createSignedMealPhotoUrls(mealPhotoPaths);
      const workoutEntries = workoutLogs?.map(toWorkoutLogEntry) ?? [];

      const nextLog = normalizeDailyLog({
        ...seedLog,
        customWorkoutMuscleGroups: dailyLog?.custom_workout_muscle_groups ?? [],
        date: today,
        id: dailyLog?.id ?? `log-${user.id}-${today}`,
        mealPhotoBonusEarned: dailyLog?.meal_photo_bonus_earned ?? false,
        mealPhotoPaths,
        mealPhotos,
        userId: user.id,
        waterCups: dailyLog?.water_cups ?? 0,
        waterGoal: dailyLog?.water_goal ?? competitions[0].water_goal,
        weight: weightEntry?.weight ?? null,
        workoutCompleted: workoutEntries.length > 0 || dailyLog?.workout_completed || false,
        workoutGoalMinutes: dailyLog?.workout_goal_minutes ?? seedLog.workoutGoalMinutes,
        workoutLogs: workoutEntries,
        workoutMuscleGroups: (dailyLog?.workout_muscle_groups ?? seedLog.workoutMuscleGroups) as MuscleGroup[],
      });

      if (!isCancelled) {
        setContext(nextContext);
        setLog(nextLog);
        setSource("supabase");
        setStatusMessage("Synced with Supabase.");
      }
    }

    loadLog();

    return () => {
      isCancelled = true;
    };
  }, [seedLog]);

  async function saveToSupabase(nextLog: DailyLog, nextContext: SupabaseContext) {
    const supabase = createSupabaseBrowserClient();
    const { data: savedDailyLog, error: dailyLogError } = await supabase
      .from("daily_logs")
      .upsert(toSupabaseDailyLog(nextLog, nextContext), { onConflict: "competition_id,user_id,log_date" })
      .select("id")
      .single();

    if (dailyLogError) {
      setStatusMessage(dailyLogError.message);
      return null;
    }

    if (nextLog.weight) {
      const { error: weightError } = await supabase.from("weight_entries").upsert(
        {
          competition_id: nextContext.competitionId,
          entry_date: nextLog.date,
          user_id: nextContext.userId,
          weight: nextLog.weight,
        },
        { onConflict: "competition_id,user_id,entry_date" },
      );

      setStatusMessage(weightError ? weightError.message : "Synced with Supabase.");
      return savedDailyLog.id;
    }

    const { error: deleteWeightError } = await supabase
      .from("weight_entries")
      .delete()
      .eq("competition_id", nextContext.competitionId)
      .eq("user_id", nextContext.userId)
      .eq("entry_date", nextLog.date);

    setStatusMessage(deleteWeightError ? deleteWeightError.message : "Synced with Supabase.");
    return savedDailyLog.id;
  }

  function updateLog(updates: Partial<DailyLog>) {
    setLog((current) => {
      const nextLog = normalizeDailyLog({ ...current, ...updates });

      if (source === "supabase" && context) {
        void saveToSupabase(nextLog, context);
      }

      if (source === "local") {
        window.localStorage.setItem(storageKey, JSON.stringify(nextLog));
        setStatusMessage("Saved on this device.");
      }

      return nextLog;
    });
  }

  async function resetLog() {
    const reset = normalizeDailyLog({
      ...seedLog,
      date: getLocalDate(),
      completed: false,
      mealPhotoPaths: [],
      mealPhotos: [],
      waterCups: 0,
      weight: null,
      workoutCompleted: false,
      workoutLogs: [],
    });

    setLog(reset);

    if (source === "supabase" && context) {
      const supabase = createSupabaseBrowserClient();
      await supabase
        .from("weight_entries")
        .delete()
        .eq("competition_id", context.competitionId)
        .eq("user_id", context.userId)
        .eq("entry_date", reset.date);
      if (log.mealPhotoPaths.length > 0) {
        await supabase.storage.from("meal-photos").remove(log.mealPhotoPaths);
      }
      if (!log.id.startsWith("log-")) {
        await supabase.from("meal_logs").delete().eq("daily_log_id", log.id).eq("user_id", context.userId);
        await supabase.from("workout_logs").delete().eq("daily_log_id", log.id).eq("user_id", context.userId);
      }
      await saveToSupabase(reset, context);
      return;
    }

    window.localStorage.removeItem(getStorageKey(seedLog));
    setStatusMessage("Reset local daily log.");
  }

  async function uploadMealPhoto(file: File) {
    if (source !== "supabase" || !context) {
      const localPreviewUrl = URL.createObjectURL(file);
      updateLog({ mealPhotoPaths: [], mealPhotos: [localPreviewUrl] });
      setStatusMessage("Preview saved on this device. Sign in and finish onboarding to sync photos.");
      return;
    }

    setIsUploadingMealPhoto(true);
    const currentLog = normalizeDailyLog(log);
    const dailyLogId = await saveToSupabase(currentLog, context);

    if (!dailyLogId) {
      setIsUploadingMealPhoto(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const storagePath = `${context.userId}/${currentLog.date}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("meal-photos").upload(storagePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      setStatusMessage(uploadError.message);
      setIsUploadingMealPhoto(false);
      return;
    }

    const { error: mealLogError } = await supabase.from("meal_logs").insert({
      daily_log_id: dailyLogId,
      photo_url: storagePath,
      user_id: context.userId,
    });

    if (mealLogError) {
      setStatusMessage(mealLogError.message);
      setIsUploadingMealPhoto(false);
      return;
    }

    const mealPhotoPaths = [storagePath, ...currentLog.mealPhotoPaths];
    const mealPhotos = await createSignedMealPhotoUrls(mealPhotoPaths);
    updateLog({ mealPhotoPaths, mealPhotos });
    setStatusMessage("Meal photo uploaded.");
    setIsUploadingMealPhoto(false);
  }

  async function addWorkoutLog(entry: {
    customMuscleGroups?: string[];
    durationMinutes: number | null;
    muscleGroups: MuscleGroup[];
  }) {
    const nextLog = normalizeDailyLog({
      ...log,
      customWorkoutMuscleGroups: entry.customMuscleGroups ?? [],
      workoutCompleted: true,
      workoutGoalMinutes: entry.durationMinutes ?? log.workoutGoalMinutes,
      workoutMuscleGroups: entry.muscleGroups,
    });

    if (source !== "supabase" || !context) {
      const localEntry: WorkoutLogEntry = {
        id: crypto.randomUUID(),
        completed: true,
        createdAt: new Date().toISOString(),
        customMuscleGroups: entry.customMuscleGroups ?? [],
        durationMinutes: entry.durationMinutes,
        muscleGroups: entry.muscleGroups,
      };
      updateLog({ ...nextLog, workoutLogs: [localEntry, ...log.workoutLogs] });
      setStatusMessage("Workout saved on this device.");
      return true;
    }

    const dailyLogId = await saveToSupabase(nextLog, context);

    if (!dailyLogId) {
      return false;
    }

    const supabase = createSupabaseBrowserClient();
    const { data: workoutLog, error } = await supabase
      .from("workout_logs")
      .insert({
        completed: true,
        custom_muscle_groups: entry.customMuscleGroups ?? [],
        daily_log_id: dailyLogId,
        duration_minutes: entry.durationMinutes,
        muscle_groups: entry.muscleGroups,
        user_id: context.userId,
      })
      .select("id, completed, duration_minutes, muscle_groups, custom_muscle_groups, created_at")
      .single();

    if (error) {
      setStatusMessage(error.message);
      return false;
    }

    const workoutEntries = workoutLog ? [toWorkoutLogEntry(workoutLog), ...log.workoutLogs] : log.workoutLogs;
    updateLog({ ...nextLog, workoutLogs: workoutEntries });
    setStatusMessage("Workout logged.");
    return true;
  }

  async function removeMealPhotos() {
    const nextLog = normalizeDailyLog({ ...log, mealPhotoPaths: [], mealPhotos: [] });

    if (source === "supabase" && context) {
      const supabase = createSupabaseBrowserClient();
      if (log.mealPhotoPaths.length > 0) {
        await supabase.storage.from("meal-photos").remove(log.mealPhotoPaths);
      }
      if (!log.id.startsWith("log-")) {
        await supabase.from("meal_logs").delete().eq("daily_log_id", log.id).eq("user_id", context.userId);
      }
      await saveToSupabase(nextLog, context);
    }

    updateLog(nextLog);
  }

  return {
    addWorkoutLog,
    isUploadingMealPhoto,
    isLoading: source === "loading",
    log,
    removeMealPhotos,
    resetLog,
    source,
    statusMessage,
    updateLog,
    uploadMealPhoto,
  };
}
