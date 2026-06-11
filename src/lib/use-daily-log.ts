"use client";

import { useEffect, useMemo, useState } from "react";
import type { DailyLog } from "./types";

const STORAGE_PREFIX = "sibling-showdown:daily-log";

function getStorageKey(log: DailyLog) {
  return `${STORAGE_PREFIX}:${log.userId}:${log.date}`;
}

export function normalizeDailyLog(log: DailyLog): DailyLog {
  return {
    ...log,
    waterCups: Math.max(0, Math.min(log.waterCups, log.waterGoal)),
    mealPhotoBonusEarned: log.mealPhotos.length > 0,
    mealPhotoPaths: log.mealPhotoPaths ?? [],
    completed: Boolean(log.completed),
  };
}

export function useDailyLog(seedLog: DailyLog) {
  const storageKey = useMemo(() => getStorageKey(seedLog), [seedLog]);
  const [log, setLog] = useState(() => normalizeDailyLog(seedLog));
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const savedLog = window.localStorage.getItem(storageKey);

      if (savedLog) {
        setLog(normalizeDailyLog(JSON.parse(savedLog) as DailyLog));
      }

      setIsLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [storageKey]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(normalizeDailyLog(log)));
  }, [isLoaded, log, storageKey]);

  function updateLog(updates: Partial<DailyLog>) {
    setLog((current) => normalizeDailyLog({ ...current, ...updates }));
  }

  function resetLog() {
    window.localStorage.removeItem(storageKey);
    setLog(normalizeDailyLog(seedLog));
  }

  return {
    log,
    updateLog,
    resetLog,
  };
}
