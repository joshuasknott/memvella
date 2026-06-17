import {
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  MessageSquareText,
  Mic,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

type ProductMockupProps = {
  variant: "hero" | "senior" | "circle" | "routine" | "memory";
};

function VoiceWave() {
  return (
    <div className="flex items-end justify-center gap-1.5" aria-hidden="true">
      {[18, 32, 48, 32, 18].map((height, index) => (
        <span
          key={`${height}-${index}`}
          className="w-2 rounded-full bg-senior-primary"
          style={{ height }}
        />
      ))}
    </div>
  );
}

function TabletFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-[2rem] border-[10px] border-text-primary bg-canvas shadow-[0_28px_80px_rgba(26,29,38,0.22)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(24,92,96,0.14),transparent_42%),linear-gradient(135deg,#fbfbf9,#f5f5f7)]" />
      <div className="relative flex h-full flex-col p-6 md:p-8">{children}</div>
    </div>
  );
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-[2.25rem] border-[10px] border-text-primary bg-surface shadow-[0_28px_80px_rgba(26,29,38,0.22)]">
      <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-text-primary" />
      <div className="flex h-full flex-col bg-canvas px-5 pb-6 pt-10">
        {children}
      </div>
    </div>
  );
}

function HeroMockup() {
  return (
    <TabletFrame>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-headline text-xl font-bold text-text-secondary">
            Good morning, Margaret
          </p>
          <p className="mt-1 font-headline text-5xl font-extrabold text-text-primary md:text-6xl">
            9:41
          </p>
        </div>
        <div className="rounded-full bg-senior-primary px-5 py-3 text-sm font-bold text-white">
          Tap to Talk
        </div>
      </div>

      <div className="mt-auto grid grid-cols-[1.05fr_0.95fr] gap-4">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
          <p className="text-sm font-bold uppercase tracking-widest text-family-primary">
            Next routine
          </p>
          <p className="mt-2 font-headline text-2xl font-bold text-text-primary">
            Morning tea at 10:00
          </p>
          <p className="mt-3 text-base text-text-secondary">
            A calm prompt is ready when it is time.
          </p>
        </div>
        <div className="rounded-2xl bg-senior-primary p-5 text-white shadow-card">
          <Mic className="h-8 w-8" />
          <p className="mt-4 text-lg font-bold">Voice is ready</p>
          <p className="mt-1 text-sm text-white/80">No menus to manage.</p>
        </div>
      </div>
    </TabletFrame>
  );
}

function SeniorMockup() {
  return (
    <TabletFrame>
      <div className="grid h-full place-items-center">
        <div className="w-full max-w-md rounded-[2rem] border border-border bg-white/90 p-8 text-center shadow-card">
          <p className="text-sm font-bold uppercase tracking-widest text-family-muted">
            Memvella
          </p>
          <h3 className="mt-4 font-headline text-3xl font-bold text-text-primary">
            Good morning, Margaret.
          </h3>
          <p className="mt-3 text-lg text-text-secondary">
            Your morning tea is coming up at 10:00.
          </p>
          <div className="mt-8">
            <VoiceWave />
          </div>
        </div>
      </div>
    </TabletFrame>
  );
}

function CircleMockup() {
  return (
    <PhoneFrame>
      <div className="flex items-center justify-between">
        <p className="text-lg font-extrabold text-family-primary">Workspace</p>
        <Users className="h-5 w-5 text-family-primary" />
      </div>
      <div className="mt-6 rounded-2xl bg-surface p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-widest text-family-primary">
          Current status
        </p>
        <p className="mt-3 text-xl font-bold text-text-primary">
          Margaret has a quiet morning planned.
        </p>
        <p className="mt-2 text-sm text-text-secondary">
          Routines and memories are ready for today.
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-family-primary/10 p-4">
          <BookOpen className="h-5 w-5 text-family-primary" />
          <p className="mt-3 text-sm font-bold text-text-primary">Add Memory</p>
        </div>
        <div className="rounded-2xl bg-family-accent/10 p-4">
          <CalendarCheck className="h-5 w-5 text-family-accent" />
          <p className="mt-3 text-sm font-bold text-text-primary">Add Routine</p>
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-surface p-4 shadow-card">
        <div className="flex items-center gap-3">
          <MessageSquareText className="h-5 w-5 text-family-accent" />
          <p className="text-sm font-bold text-text-primary">
            2 insights ready for review
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}

function RoutineMockup() {
  return (
    <TabletFrame>
      <div className="grid h-full grid-cols-[0.9fr_1.1fr] gap-5">
        <div className="flex flex-col justify-center">
          <p className="font-headline text-2xl font-bold text-text-secondary">
            Today is Thursday, May 28
          </p>
          <p className="mt-4 font-headline text-5xl font-extrabold text-text-primary">
            10:00
          </p>
        </div>
        <div className="flex flex-col justify-center gap-4">
          {["Morning tea", "Garden walk", "Call with Anna"].map((item, index) => (
            <div key={item} className="rounded-2xl bg-surface p-4 shadow-card">
              <div className="flex items-center gap-3">
                <CheckCircle2
                  className={`h-6 w-6 ${
                    index === 0 ? "text-status-success" : "text-family-muted"
                  }`}
                />
                <p className="font-bold text-text-primary">{item}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TabletFrame>
  );
}

function MemoryMockup() {
  return (
    <TabletFrame>
      <div className="grid h-full place-items-center">
        <div className="w-full max-w-lg overflow-hidden rounded-[2rem] bg-surface shadow-card">
          <div className="h-40 bg-[linear-gradient(135deg,#185c60,#676f9d_55%,#ff8c42)]" />
          <div className="p-6">
            <p className="text-sm font-bold uppercase tracking-widest text-family-accent">
              Memory
            </p>
            <h3 className="mt-2 font-headline text-3xl font-bold text-text-primary">
              Summer at the pier
            </h3>
            <p className="mt-3 text-lg leading-relaxed text-text-secondary">
              A family story, photo, or voice note can return in conversation.
            </p>
          </div>
        </div>
      </div>
    </TabletFrame>
  );
}

export function ProductMockup({ variant }: ProductMockupProps) {
  if (variant === "hero") return <HeroMockup />;
  if (variant === "senior") return <SeniorMockup />;
  if (variant === "circle") return <CircleMockup />;
  if (variant === "routine") return <RoutineMockup />;
  return <MemoryMockup />;
}
