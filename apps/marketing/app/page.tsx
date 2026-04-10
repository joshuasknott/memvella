import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { TrustAndDignity } from "@/components/sections/Philosophy";
import { WaitlistCTA } from "@/components/sections/WaitlistCTA";

export default function MarketingHomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-purple-100 selection:text-purple-900">
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <TrustAndDignity />
        <WaitlistCTA />
      </main>
      <Footer />
    </div>
  );
}
