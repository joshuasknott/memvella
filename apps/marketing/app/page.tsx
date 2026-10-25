import type { Metadata } from "next";
import { ArrowRight, FileText, Plus, Tablet } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import WaitlistForm from "@/components/ui/WaitlistForm";
import { CompanionPreview } from "@/components/CompanionPreview";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const steps = [
  { icon: FileText, title: "Share a memory.", text: "Add stories, photos or recordings from your phone, whenever you like." },
  { icon: Tablet, title: "Connect a tablet.", text: "Use a simple pairing code to bring their companion to a familiar screen." },
  { icon: Plus, title: "Keep adding moments.", text: "A new story. A favourite routine. Little things that keep you connected." },
];

const questions = [
  {
    question: "Who is Memvella for?",
    answer: "Memvella is for older people and the family and trusted friends who want to stay connected with them. You add familiar memories and routines; the companion brings them together on a simple tablet screen.",
  },
  {
    question: "Do we need a special tablet?",
    answer: "There’s no dedicated Memvella device to buy. The companion runs in a web browser on a tablet with an internet connection and microphone. We’ll help you check compatibility during early access.",
  },
  {
    question: "Who can see our memories?",
    answer: "Your memories belong in your private Workspace, shared with the Supporters you invite and the companion tablet you connect. They are never published on a public feed.",
  },
  {
    question: "When can we try it?",
    answer: "We’re getting Memvella ready for more families. Join the waitlist and we’ll email you when early access opens. We haven’t announced a wider launch date yet.",
  },
];

export default function MarketingHomePage() {
  return (
    <div className="marketing-page">
      <a href="#main-content" className="marketing-skip">Skip to content</a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <section className="marketing-hero marketing-container" aria-labelledby="hero-title">
          <h1 id="hero-title">
            <span>A little company.</span>
            <span>A <em>familiar</em> world.</span>
          </h1>
          <p className="marketing-lead">
            Familiar stories, gentle routines and a voice to talk to.
            <br className="desktop-break" /> A companion tablet made personal by family.
          </p>
          <div className="hero-actions">
            <a href="#waitlist" className="marketing-button">
              Join the waitlist <ArrowRight size={25} aria-hidden="true" />
            </a>
            <a href="#companion" className="marketing-text-link">
              Meet the companion <ArrowRight size={23} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section id="companion" className="marketing-demo marketing-container" aria-label="Meet the Memvella companion">
          <CompanionPreview />
        </section>

        <section id="how-it-works" className="marketing-how marketing-container" aria-labelledby="how-title">
          <h2 id="how-title">You add the personal touch.</h2>
          <ol className="marketing-steps">
            {steps.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className="step-icon"><Icon size={30} strokeWidth={1.6} aria-hidden="true" /></span>
                <div><h3>{title}</h3><p>{text}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section id="questions" className="marketing-faq marketing-container" aria-labelledby="questions-title">
          <div className="section-heading">
            <h2 id="questions-title">A few things<br /> you might wonder.</h2>
            <a className="marketing-text-link" href="/contact">
              Ask us something else <ArrowRight size={20} aria-hidden="true" />
            </a>
          </div>
          <div className="faq-list">
            {questions.map(({ question, answer }) => (
              <details key={question}>
                <summary>{question}<Plus size={23} aria-hidden="true" /></summary>
                <p>
                  {answer}
                  {question === "Who can see our memories?" && <> <a href="/privacy">Read our privacy policy</a>.</>}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section id="waitlist" className="marketing-waitlist" aria-labelledby="waitlist-title">
          <div className="marketing-container waitlist-inner">
            <h2 id="waitlist-title">A little more familiar.<br /><span>A little closer.</span></h2>
            <p>Be the first to hear when Memvella is ready for your family.</p>
            <div className="waitlist-content"><WaitlistForm /></div>
            <p className="marketing-note">Early-access updates only. Unsubscribe any time.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
