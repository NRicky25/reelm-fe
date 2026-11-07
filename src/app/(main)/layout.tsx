import { Header } from "@/components/layout/header";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-dvh pb-24 md:pb-16">{children}</main>
      <MobileTabBar />
    </>
  );
}
