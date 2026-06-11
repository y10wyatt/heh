import Link from "next/link";
import { BarChart3, Home, Pencil, UserRound } from "lucide-react";

const items = [
  { href: "/", label: "Home", key: "home", icon: Home },
  { href: "/log", label: "Log", key: "log", icon: Pencil },
  { href: "/progress", label: "Progress", key: "progress", icon: BarChart3 },
  { href: "/profile", label: "Profile", key: "profile", icon: UserRound },
] as const;

type BottomNavProps = {
  activeTab: (typeof items)[number]["key"];
};

export function BottomNav({ activeTab }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md px-4 pb-3">
      <div className="doodle-card grid grid-cols-4 rounded-[1.5rem] bg-white/92 px-2 py-2 backdrop-blur">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-bold transition ${
                isActive ? "bg-blue text-charcoal" : "text-charcoal/65"
              }`}
              href={item.href}
              key={item.key}
            >
              <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={2.4} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
