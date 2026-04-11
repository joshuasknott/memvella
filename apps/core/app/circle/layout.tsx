import CircleBottomNav from "@/components/CircleBottomNav";
import CircleHeader from "@/components/CircleHeader";
import CircleProfileBootstrap from "@/components/CircleProfileBootstrap";

export default function CircleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-surface font-body text-on-surface">
      <CircleProfileBootstrap />
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-surface shadow-2xl">
        <CircleHeader />
        <main className="flex flex-1 flex-col overflow-y-auto pb-24 pt-24">
          {children}
        </main>
        <CircleBottomNav />
      </div>
    </div>
  );
}
