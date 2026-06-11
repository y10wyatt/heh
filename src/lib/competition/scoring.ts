import type { DailyLog, User } from "@/lib/types";

export function getWeightLost(user: User) {
  if (!user.startingWeight || !user.currentWeight) {
    return 0;
  }

  return Number((user.startingWeight - user.currentWeight).toFixed(1));
}

export function getPercentLost(user: User) {
  if (!user.startingWeight) {
    return 0;
  }

  return Number(((getWeightLost(user) / user.startingWeight) * 100).toFixed(2));
}

export function getDailyConsistencyScore(log: DailyLog | null) {
  if (!log) {
    return 0;
  }

  const hydrationPoint = log.waterCups >= log.waterGoal ? 1 : 0;
  const workoutPoint = log.workoutCompleted ? 1 : 0;
  const mealBonus = log.mealPhotoBonusEarned || log.mealPhotos.length > 0 ? 0.5 : 0;

  return hydrationPoint + workoutPoint + mealBonus;
}

export function getWeeklyConsistencyScore(logs: DailyLog[]) {
  return Number(logs.reduce((total, log) => total + getDailyConsistencyScore(log), 0).toFixed(1));
}

export function pickWinnerName(firstName: string, firstScore: number, secondName: string, secondScore: number) {
  if (firstScore === secondScore) {
    return "Tie";
  }

  return firstScore > secondScore ? firstName : secondName;
}
