export type VisualAsset = {
  src?: string;
  fallback: string;
  alt: string;
};

/**
 * Replace any `src` with a file under `/public/assets`.
 * The fallback remains visible until artwork is supplied.
 */
export const visualAssets: Record<
  "mascot"|"trophy"|"williamAvatar"|"sisterAvatar"|"roomActivity"|
  "resultCelebration"|"roomWorkshop"|"roomSky"|"williamFullBody"|"sisterFullBody"|
  "houseAirship"|"confettiEffect"|"shieldEffect",
  VisualAsset
> = {
  mascot: { fallback: "🐹", alt: "Hamster pilot mascot" },
  trophy: { fallback: "🏆", alt: "Trophy" },
  williamAvatar: { fallback: "🐹", alt: "William's hamster avatar" },
  sisterAvatar: { fallback: "🐹", alt: "Sister's hamster avatar" },
  roomActivity: { fallback: "🎉", alt: "Room activity" },
  resultCelebration: { fallback: "🎉", alt: "Celebration" },
  roomWorkshop: { fallback: "🐹", alt: "William's workshop room" },
  roomSky: { fallback: "🐹", alt: "Sister's sky room" },
  williamFullBody: { fallback: "🐹", alt: "William full-body hamster avatar" },
  sisterFullBody: { fallback: "🐹", alt: "Sister full-body hamster avatar" },
  houseAirship: { fallback: "🏠", alt: "Shared steampunk airship house" },
  confettiEffect: { fallback: "🎊", alt: "Harmless confetti prank effect" },
  shieldEffect: { fallback: "🛡", alt: "Protected room slot effect" },
};

export type VisualAssetKey = keyof typeof visualAssets;
