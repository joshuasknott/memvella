import Link from 'next/link';
import { Calendar } from 'lucide-react';

export default function CaregiverRoutinesPage() {
  return (
    <div className="flex flex-col gap-6 px-4 w-full">
      <h1 className="font-headline font-extrabold text-3xl text-on-surface tracking-tight">Care Routines</h1>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center mt-20 text-center">
        <div className="w-24 h-24 rounded-4xl bg-surface-container-high flex items-center justify-center mb-6 shadow-xs relative overflow-hidden">
          <Calendar className="w-10 h-10 text-on-surface-variant translate-y-[-2px]" strokeWidth={2} />
          <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-primary/5 blur-xl"></div>
        </div>
        <p className="font-headline font-bold text-xl text-on-surface mb-2">No routines yet</p>
        <p className="text-outline text-sm leading-relaxed max-w-[250px] mb-8">
          Your daily schedules and reminders will appear here.
        </p>
        <Link 
          href="/caregiver/add-routine" 
          className="w-full h-14 bg-surface-container-high hover:bg-surface-container-highest transition-colors text-on-surface font-headline font-bold rounded-full flex items-center justify-center shadow-sm"
        >
          Add Routine
        </Link>
      </div>
    </div>
  );
}
