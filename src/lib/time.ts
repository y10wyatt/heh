const EVENING_CUTOFF_HOUR = 18;

export function isEveningReviewTime(date = new Date(), cutoffHour = EVENING_CUTOFF_HOUR) {
  return date.getHours() >= cutoffHour;
}

export function getEveningCutoffLabel(cutoffHour = EVENING_CUTOFF_HOUR) {
  const displayHour = cutoffHour > 12 ? cutoffHour - 12 : cutoffHour;
  const period = cutoffHour >= 12 ? "PM" : "AM";
  return `${displayHour}:00 ${period}`;
}
