import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FeatureGlimpse } from "@/components/sections/FeatureGlimpse";
import { NoHardwareFlex } from "@/components/sections/NoHardwareFlex";
import { OriginStory } from "@/components/sections/OriginStory";
import { WaitlistCTA } from "@/components/sections/WaitlistCTA";

export default function MarketingHomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-text-primary selection:bg-family-primary/10 selection:text-family-primary">
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <FeatureGlimpse />
        <NoHardwareFlex />
        <OriginStory />
        <WaitlistCTA />
      </main>
      <Footer />
    </div>
  );
}
