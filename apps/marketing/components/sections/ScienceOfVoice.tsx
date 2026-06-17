import { Brain, HeartHandshake, Users } from "lucide-react";
import { FadeIn } from "@/components/ui/FadeIn";

const pillars = [
  {
    title: "Low Cognitive Load",
    body: "The companion tablet avoids passwords, dense menus, and tiny keyboards. The senior can focus on the next calm prompt while supporters handle setup and changes elsewhere.",
    Icon: Brain,
  },
  {
    title: "Respectful Support",
    body: "Routines, memories, and familiar People context are prepared by the family and surfaced gently on the tablet, so daily support can feel familiar instead of procedural.",
    Icon: HeartHandshake,
  },
  {
    title: "Shared Peace Of Mind",
    body: "Everyone in the Workspace works from the same context: routines, memories, insights, alerts, and companion tablet setup. Less coordination drift, more shared understanding.",
    Icon: Users,
  },
];

export function ScienceOfVoice() {
  return (
    <section id="science-of-voice" className="bg-surface py-32 lg:py-48">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn>
          <div className="mb-20 max-w-3xl">
            <p className="text-base font-extrabold uppercase tracking-widest text-text-secondary">
              Why voice
            </p>
            <h2 className="mt-4 font-headline text-4xl font-extrabold leading-[1.05] tracking-tighter text-text-primary text-balance md:text-5xl">
              The senior surface should feel simple before it feels smart.
            </h2>
            <p className="mt-6 text-xl leading-relaxed text-text-secondary">
              Voice keeps the tablet experience light while the shared Workspace
              manages the structure behind it.
            </p>
          </div>
        </FadeIn>

        <div className="grid gap-12 md:grid-cols-3 lg:gap-16">
          {pillars.map((pillar, i) => (
            <FadeIn key={pillar.title} delay={i * 100}>
              <div className="flex flex-col gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-family-primary/10 text-family-primary">
                  <pillar.Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-headline text-xl font-extrabold leading-[1.05] tracking-tighter text-text-primary">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-text-secondary">
                    {pillar.body}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
