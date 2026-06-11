import type { Competition, DailyLog, Group, RivalAction, User } from "./types";

export const users: User[] = [
  {
    id: "william",
    name: "William",
    displayName: "William",
    avatar: "mint-blob",
    startingWeight: 156.1,
    currentWeight: 152.4,
    goalWeight: 145,
  },
  {
    id: "sister",
    name: "Sister",
    displayName: "Sister",
    avatar: "peach-blob",
    startingWeight: 149.8,
    currentWeight: 147.6,
    goalWeight: 140,
  },
];

export const todayLogs: DailyLog[] = [
  {
    id: "log-william-today",
    userId: "william",
    date: "2026-06-09",
    weight: 152.4,
    waterCups: 4,
    waterGoal: 8,
    mealPhotos: [],
    workoutGoalMinutes: 30,
    workoutMuscleGroups: ["upper-body"],
    customWorkoutMuscleGroups: [],
    workoutCompleted: false,
    mealPhotoBonusEarned: false,
    completed: false,
  },
  {
    id: "log-sister-today",
    userId: "sister",
    date: "2026-06-09",
    weight: 147.6,
    waterCups: 8,
    waterGoal: 8,
    mealPhotos: ["/assets/meal-placeholder.svg"],
    workoutGoalMinutes: 30,
    workoutMuscleGroups: ["lower-body"],
    customWorkoutMuscleGroups: [],
    workoutCompleted: false,
    mealPhotoBonusEarned: true,
    completed: false,
  },
];

export const groups: Group[] = [
  {
    id: "sibling-showdown",
    name: "Sibling Showdown",
    memberIds: users.map((user) => user.id),
  },
];

export const competition: Competition = {
  id: "competition-june-2026",
  groupId: groups[0].id,
  userA: users[0],
  userB: users[1],
  startDate: "2026-06-01",
  endDate: "2026-06-30",
  weeklyWeighInDay: 1,
  progressType: "consistency-and-percent",
  waterGoal: 8,
};

export const rivalActions: RivalAction[] = [
  {
    id: "action-1",
    fromUserId: "william",
    toUserId: "sister",
    type: "tease",
    date: "2026-06-09",
    reason: "Workout goal missed",
    cosmeticOnly: true,
  },
];

export const weeklyTrend = [
  { label: "Mon", you: 0.4, sibling: 0.2 },
  { label: "Tue", you: 0.7, sibling: 0.5 },
  { label: "Wed", you: 1.2, sibling: 0.8 },
  { label: "Thu", you: 1.6, sibling: 1.0 },
  { label: "Fri", you: 2.4, sibling: 1.4 },
  { label: "Sat", you: 3.0, sibling: 1.8 },
  { label: "Sun", you: 3.7, sibling: 2.2 },
];

export function getCurrentUser() {
  return users[0];
}

export function getSiblingUser() {
  return users[1];
}

export function getTodayLog(userId: string) {
  const log = todayLogs.find((entry) => entry.userId === userId);

  if (!log) {
    throw new Error(`Missing mock daily log for user: ${userId}`);
  }

  return log;
}

export function getWeightLost(user: User) {
  return Number((user.startingWeight - user.currentWeight).toFixed(1));
}
