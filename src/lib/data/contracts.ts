import type { Competition, CompetitionSummary, DailyLog, Group, RivalAction, User, WeeklyTrendPoint } from "@/lib/types";

export type HomeData = {
  user: User;
  sibling: User;
  todayLog: DailyLog;
  latestRivalAction: RivalAction;
};

export type ProgressData = {
  competition: Competition;
  summary: CompetitionSummary;
  weeklyTrend: WeeklyTrendPoint[];
};

export type ProfileData = {
  user: User;
  group: Group;
  competition: Competition;
  members: User[];
};

export type AppDataProvider = {
  getHomeData: () => HomeData;
  getLogData: () => { user: User; todayLog: DailyLog };
  getProgressData: () => ProgressData;
  getProfileData: () => ProfileData;
};
