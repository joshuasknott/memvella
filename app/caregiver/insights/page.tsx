import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function InsightsPlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 w-full flex-1">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex flex-col items-center justify-center mb-6 border border-primary/20">
         <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <p className="font-headline text-lg font-bold text-gray-900 mb-2">No new insights to review today.</p>
      <p className="text-gray-500 text-sm max-w-[220px] leading-relaxed mb-6">
        When Memvella learns something new about Mom, it will appear here for your approval.
      </p>
      <Link 
        href="/caregiver" 
        className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-full shadow-sm active:scale-95 transition-transform text-sm"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
