import CircleBottomNav from "@/components/CircleBottomNav";
import CircleHeader from "@/components/CircleHeader";
import CircleProfileBootstrap from "@/components/CircleProfileBootstrap";

export default function CircleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-canvas font-body text-text-primary">
      <CircleProfileBootstrap />
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col bg-surface shadow-ambient">
        <CircleHeader />
        <main className="flex flex-1 flex-col overflow-y-auto pb-32 pt-24 px-4 md:px-8">
          {children}
        </main>
        <CircleBottomNav />
      </div>
    </div>
  );
}
