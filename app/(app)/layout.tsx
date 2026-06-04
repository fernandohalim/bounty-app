import { BottomNav } from "@/components/bottom-nav";
import { OnlineSync } from "@/components/online-sync";
import { InstallPrompt } from "@/components/install-prompt";
import { AddSheetProvider, AddExpenseOverlay } from "@/components/add-sheet";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AddSheetProvider>
      <div className="mx-auto min-h-screen w-full max-w-md pb-24">
        <InstallPrompt />
        {children}
        <BottomNav />
        <OnlineSync />
      </div>
      <AddExpenseOverlay />
    </AddSheetProvider>
  );
}
