const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function getWeeklyWeighInLabel(weekday: number) {
  return weekdayNames[weekday] ?? "weekly";
}

export function isWeeklyWeighInDay(weekday: number, date = new Date()) {
  return date.getDay() === weekday;
}

export function getWeeklyWeighInMessage(weekday: number, hasWeightToday: boolean) {
  const label = getWeeklyWeighInLabel(weekday);

  if (isWeeklyWeighInDay(weekday)) {
    return hasWeightToday ? `${label} weigh-in logged.` : `${label} is weigh-in day. Add weight when ready.`;
  }

  return `Weekly weigh-in day: ${label}. Daily weight is optional.`;
}
