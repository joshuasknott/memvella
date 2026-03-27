import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

export default function UniversalSplash() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-[#faf9f6] px-6 text-center font-body">
      <div className="mb-12">
        {/* Assume BrandLogo returns an SVG that inherits height */}
        <BrandLogo className="w-auto h-20" />
      </div>
      
      <div className="space-y-4 mb-16 max-w-lg">
        <h1 className="font-headline text-5xl font-bold text-gray-900 tracking-tight">
          Welcome to Memvella.
        </h1>
        <p className="text-xl text-gray-600 font-medium">
          A friendly companion for memories, routines, and peace of mind.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md mx-auto mt-8">
        <Link 
          href="/onboarding/caregiver" 
          className="w-full bg-[#4e0078] text-white rounded-2xl py-5 font-semibold text-lg hover:bg-[#3d005e] active:scale-95 transition-all shadow-sm flex items-center justify-center"
        >
          I&apos;m setting this up for someone I care for
        </Link>

        <Link 
          href="/onboarding/independent" 
          className="w-full bg-white text-[#4e0078] border-2 border-[#4e0078] rounded-2xl py-5 font-semibold text-lg hover:bg-purple-50 active:scale-95 transition-all flex items-center justify-center"
        >
          I&apos;m setting this up for myself
        </Link>

        <Link 
          href="/senior/setup" 
          className="w-full bg-purple-100 text-[#4e0078] rounded-2xl py-5 font-semibold text-lg hover:bg-purple-200 active:scale-95 transition-all flex items-center justify-center"
        >
          I have a 6-digit connection code
        </Link>
      </div>
    </main>
  );
}
