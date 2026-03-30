import BrandLogo from '@/components/BrandLogo';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';

export default function UniversalSplash() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-linear-to-b from-primary-fixed border-t border-transparent to-surface px-6 text-center font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
      <div className="mb-12">
        <BrandLogo className="w-auto h-20 md:h-24 drop-shadow-sm transition-all" />
      </div>
      
      <div className="w-full max-w-lg flex flex-col items-center animate-in slide-in-from-bottom-4 fade-in duration-500 zoom-in-95">
        <div className="space-y-4 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a] text-center mb-8">
            Welcome to Memvella.
          </h1>
          <p className="text-xl md:text-2xl text-on-surface-variant font-medium tracking-wide text-center">
            How would you like to begin?
          </p>
        </div>

        <div className="flex flex-col space-y-4 md:space-y-6 w-full max-w-sm md:max-w-md mx-auto">
          <PrimaryButton href="/assisted/login">
            I have a Connection Code
          </PrimaryButton>

          <SecondaryButton href="/onboarding/supporter">
            Start a new Family Space
          </SecondaryButton>

          <SecondaryButton href="/onboarding/independent">
            I am setting this up for myself
          </SecondaryButton>
        </div>
      </div>
    </main>
  );
}
