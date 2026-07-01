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
  "resultCelebration"|"roomWorkshop"|"roomSky",
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
};

export type VisualAssetKey = keyof typeof visualAssets;
