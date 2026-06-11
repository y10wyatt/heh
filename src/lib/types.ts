export type AvatarId = "mint-blob" | "peach-blob" | "lavender-blob";

export type MuscleGroup =
  | "full-body"
  | "upper-body"
  | "lower-body"
  | "arms"
  | "shoulders"
  | "core"
  | "cardio"
  | "custom";

export type User = {
  id: string;
  name: string;
  displayName: string;
  avatar: AvatarId;
  startingWeight: number;
  currentWeight: number;
  goalWeight: number;
};

export type DailyLog = {
  id: string;
  userId: string;
  date: string;
  weight: number | null;
  waterCups: number;
  waterGoal: number;
  mealPhotos: string[];
  workoutGoalMinutes: number;
  workoutMuscleGroups: MuscleGroup[];
  customWorkoutMuscleGroups: string[];
  workoutCompleted: boolean;
  mealPhotoBonusEarned: boolean;
  completed: boolean;
};

export type Group = {
  id: string;
  name: string;
  memberIds: string[];
};

export type Competition = {
  id: string;
  groupId: string;
  userA: User;
  userB: User;
  startDate: string;
  endDate: string;
  weeklyWeighInDay: number;
  progressType: "consistency-and-percent";
  waterGoal: number;
};

export type RivalAction = {
  id: string;
  fromUserId: string;
  toUserId: string;
  type: "nudge" | "tease" | "extra-challenge" | "paint" | "tomato";
  date: string;
  reason: string;
  cosmeticOnly: true;
};

export type WeeklyTrendPoint = {
  label: string;
  you: number;
  sibling: number;
};

export type CompetitionSummary = {
  you: User;
  sibling: User;
  youWeightLost: number;
  siblingWeightLost: number;
  youPercentLost: number;
  siblingPercentLost: number;
  youConsistencyScore: number;
  siblingConsistencyScore: number;
  dailyWinnerName: string;
  weeklyWinnerName: string;
  totalWinnerName: string;
  leaderName: string;
  weeklyTrend: WeeklyTrendPoint[];
};
