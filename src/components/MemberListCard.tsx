import type { User } from "@/lib/types";

type MemberListCardProps = {
  members: User[];
};

const avatarColors: Record<User["avatar"], string> = {
  "mint-blob": "bg-mint",
  "peach-blob": "bg-coral",
  "lavender-blob": "bg-lavender",
};

export function MemberListCard({ members }: MemberListCardProps) {
  return (
    <section className="doodle-card rounded-[1.5rem] bg-white p-4">
      <h2 className="mb-3 text-sm font-black uppercase">Group Members</h2>
      <div className="grid gap-2">
        {members.map((member) => (
          <div className="flex items-center gap-3 rounded-2xl bg-cream px-3 py-2" key={member.id}>
            <span className={`h-9 w-8 rounded-[48%_52%_45%_55%] border-2 border-charcoal ${avatarColors[member.avatar]}`} />
            <div className="flex-1">
              <p className="text-sm font-black">{member.displayName}</p>
              <p className="text-xs font-bold text-charcoal/60">{member.id === "waiting-for-sibling" ? "Invite pending" : "Member"}</p>
            </div>
          </div>
        ))}
        {members.length < 2 ? (
          <div className="rounded-2xl border-2 border-dashed border-charcoal/30 bg-gold/60 px-3 py-3 text-sm font-black">
            Waiting for your sister. Create an invite from this screen.
          </div>
        ) : null}
      </div>
    </section>
  );
}
