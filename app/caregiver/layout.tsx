export default function CaregiverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface text-on-surface font-body min-h-screen">
      {/* 
        Caregiver layout is typically restricted to a mobile max-width, 
        even when viewed on larger screens, to ensure the UI remains as designed.
      */}
      <div className="relative mx-auto max-w-md min-h-dvh bg-surface pb-24 shadow-2xl">
        {children}
      </div>
    </div>
  );
}
