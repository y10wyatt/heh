import type { AppDataProvider } from "./contracts";
import { competition, getCurrentUser, getSiblingUser, getTodayLog, getWeightLost, groups, rivalActions, users, weeklyTrend } from "@/lib/mock-data";
import { getDailyConsistencyScore, getPercentLost, pickWinnerName } from "@/lib/competition/scoring";

export const mockDataProvider: AppDataProvider = {
  getHomeData() {
    const user = getCurrentUser();

    return {
      user,
      sibling: getSiblingUser(),
      todayLog: getTodayLog(user.id),
      latestRivalAction: rivalActions[0],
    };
  },

  getLogData() {
    const user = getCurrentUser();

    return {
      user,
      todayLog: getTodayLog(user.id),
    };
  },

  getProgressData() {
    const youWeightLost = getWeightLost(competition.userA);
    const siblingWeightLost = getWeightLost(competition.userB);

    return {
      competition,
      summary: {
        you: competition.userA,
        sibling: competition.userB,
        youWeightLost,
        siblingWeightLost,
        youPercentLost: getPercentLost(competition.userA),
        siblingPercentLost: getPercentLost(competition.userB),
        youConsistencyScore: getDailyConsistencyScore(getTodayLog(competition.userA.id)),
        siblingConsistencyScore: getDailyConsistencyScore(getTodayLog(competition.userB.id)),
        dailyWinnerName: pickWinnerName(
          competition.userA.displayName,
          getDailyConsistencyScore(getTodayLog(competition.userA.id)),
          competition.userB.displayName,
          getDailyConsistencyScore(getTodayLog(competition.userB.id)),
        ),
        weeklyWinnerName: pickWinnerName(competition.userA.displayName, youWeightLost, competition.userB.displayName, siblingWeightLost),
        totalWinnerName: pickWinnerName(competition.userA.displayName, getPercentLost(competition.userA), competition.userB.displayName, getPercentLost(competition.userB)),
        leaderName: youWeightLost >= siblingWeightLost ? competition.userA.displayName : competition.userB.displayName,
        weeklyTrend,
      },
      weeklyTrend,
    };
  },

  getProfileData() {
    return {
      user: getCurrentUser(),
      group: groups[0],
      competition,
      members: users,
    };
  },
};
