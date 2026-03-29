export default function SeniorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface text-on-surface font-body min-h-screen w-full md:h-screen md:w-screen md:overflow-hidden">
      {/* 
        Senior layout is an unrestricted tablet landscape view.
        Navigation is intentionally hidden per the design system to minimize cognitive load.
      */}
      {children}
    </div>
  );
}
