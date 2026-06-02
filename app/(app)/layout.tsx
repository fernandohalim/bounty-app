import { BottomNav } from "@/components/bottom-nav";
import { OnlineSync } from "@/components/online-sync";
import { InstallPrompt } from "@/components/install-prompt";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-md pb-24">
      <InstallPrompt />
      {children}
      <BottomNav />
      <OnlineSync />
    </div>
  );
}
