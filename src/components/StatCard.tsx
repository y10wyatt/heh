import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string;
  detail?: string;
  icon?: ReactNode;
  accent?: "blue" | "mint" | "coral" | "gold";
};

const accents = {
  blue: "bg-blue",
  mint: "bg-mint",
  coral: "bg-coral",
  gold: "bg-gold",
};

export function StatCard({ title, value, detail, icon, accent = "blue" }: StatCardProps) {
  return (
    <article className="doodle-card rounded-[1.25rem] bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-black uppercase tracking-normal">{title}</h3>
        {icon ? <div className={`rounded-2xl border-2 border-charcoal p-2 ${accents[accent]}`}>{icon}</div> : null}
      </div>
      <p className="text-3xl font-black">{value}</p>
      {detail ? <p className="mt-1 text-sm font-bold text-charcoal/65">{detail}</p> : null}
    </article>
  );
}
