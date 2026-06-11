import type { User } from "@/lib/types";

const avatarStyles: Record<User["avatar"], string> = {
  "mint-blob": "bg-mint",
  "peach-blob": "bg-coral",
  "lavender-blob": "bg-lavender",
};

type MascotBubbleProps = {
  user: User;
  message: string;
  mood?: "happy" | "focused" | "sleepy";
};

export function MascotBubble({ user, message, mood = "happy" }: MascotBubbleProps) {
  const mouth = mood === "focused" ? "h-1 w-5 rounded-full bg-charcoal" : "h-3 w-5 rounded-b-full border-b-4 border-charcoal";

  return (
    <section className="relative flex items-end gap-3 py-4">
      <div className={`relative h-28 w-24 rounded-[48%_52%_45%_55%] border-2 border-charcoal ${avatarStyles[user.avatar]} shadow-doodle`}>
        <span className="absolute left-6 top-10 h-2 w-2 rounded-full bg-charcoal" />
        <span className="absolute right-6 top-10 h-2 w-2 rounded-full bg-charcoal" />
        <span className={`absolute left-1/2 top-14 -translate-x-1/2 ${mouth}`} />
        <span className="absolute left-4 top-14 h-2 w-3 rounded-full bg-peach/80" />
        <span className="absolute right-4 top-14 h-2 w-3 rounded-full bg-peach/80" />
        <span className="absolute -right-3 top-10 h-8 w-4 rotate-[-24deg] rounded-full border-2 border-charcoal bg-inherit" />
      </div>
      <div className="doodle-card relative flex-1 rounded-[1.5rem] bg-white px-4 py-3 text-sm font-bold leading-relaxed">
        {message}
        <span className="absolute -left-3 bottom-5 h-5 w-5 rotate-45 border-b-2 border-l-2 border-charcoal bg-white" />
      </div>
      <span className="absolute right-4 top-2 text-2xl text-gold">★</span>
      <span className="absolute left-24 top-1 text-xl text-peach">♡</span>
    </section>
  );
}
