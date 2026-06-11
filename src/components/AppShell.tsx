import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

type AppShellProps = {
  children: ReactNode;
  activeTab: "home" | "log" | "progress" | "profile";
};

export function AppShell({ children, activeTab }: AppShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-cream px-4 pb-24 pt-5 shadow-2xl md:my-8 md:min-h-[860px] md:rounded-[2rem] md:border-4 md:border-charcoal">
      {children}
      <BottomNav activeTab={activeTab} />
    </main>
  );
}
