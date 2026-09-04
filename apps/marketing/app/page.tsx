import Image from "next/image";
import {
  ArrowRight,
  CalendarClock,
  ChevronRight,
  Clock3,
  HandHeart,
  Images,
  Plus,
  Speech,
  Tablet,
  Users,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import WaitlistForm from "@/components/ui/WaitlistForm";
import { CompanionPreview } from "@/components/CompanionPreview";

const features = [
  {
    icon: Speech,
    title: "A friendly voice",
    text: "Conversations shaped around familiar people and stories.",
  },
  {
    icon: Images,
    title: "Memories worth revisiting",
    text: "Photos, recordings and stories shared by family.",
  },
  {
    icon: CalendarClock,
    title: "A gentler rhythm",
    text: "Simple reminders for the little things in their day.",
  },
];
const steps = [
  {
    title: "Make it theirs",
    text: "Add photos, stories and routines that feel like home.",
  },
  {
    title: "Connect a tablet",
    text: "Use a pairing code to connect their companion tablet.",
  },
  {
    title: "Keep adding moments",
    text: "Share new memories from your phone, wherever you are.",
  },
];
const questions = [
  {
    question: "Who is Memvella for?",
    answer:
      "Memvella is for older people and the family and trusted friends who want to stay connected with them. Family adds familiar memories and routines; the companion brings them together on a simple tablet screen.",
  },
  {
    question: "Do we need a special device?",
    answer:
      "There’s no dedicated Memvella device to buy. The companion runs in a web browser on a tablet with an internet connection and microphone. We’ll help you check compatibility during early access.",
  },
  {
    question: "When can we try it?",
    answer:
      "Memvella is in early access. Join the waitlist and we’ll email you when there’s a place for your family. We haven’t announced a wider launch date yet.",
  },
  {
    question: "Who can see our memories?",
    answer:
      "Memories are shared in your private Workspace with the Supporters you invite and the companion tablet you connect. They are not published on a public feed.",
  },
];

export default function MarketingHomePage() {
  return (
    <div className="marketing-page">
      <a href="#main-content" className="marketing-skip">
        Skip to content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <div className="marketing-intro">
          <section
            className="marketing-hero marketing-container"
            aria-labelledby="hero-title"
          >
            <div className="hero-copy">
              <p className="marketing-eyebrow">Familiar moments. Every day.</p>
              <h1 id="hero-title">
                Their stories.
                <br />
                Their routines.
                <br />
                Your connection.
              </h1>
              <p className="marketing-lead">
                A friendly voice, familiar memories and gentle reminders. A
                little more connection for older people, with family close by.
              </p>
              <div className="hero-actions">
                <a href="#waitlist" className="marketing-button">
                  Join the waitlist <ArrowRight size={21} aria-hidden="true" />
                </a>
                <a href="#companion" className="marketing-text-link">
                  Meet the companion{" "}
                  <ChevronRight size={18} aria-hidden="true" />
                </a>
              </div>
              <p className="hero-footnote">
                Made for families. Designed for everyday life.
              </p>
            </div>
            <div className="hero-visual">
              <figure className="hero-photo">
                <Image
                  src="/images/family-album-v2.webp"
                  alt="A mother and daughter laughing together over a family photo album"
                  fill
                  sizes="(min-width: 1440px) 720px, (min-width: 761px) 54vw, 92vw"
                  preload
                />
              </figure>
              <div
                className="hero-reminder"
                aria-label="Example routine reminder: Tea in the garden at 3 pm"
              >
                <span className="reminder-icon">
                  <Clock3 size={32} strokeWidth={1.4} aria-hidden="true" />
                </span>
                <div>
                  <strong>A little nudge</strong>
                  <span>3:00 pm · Tea in the garden</span>
                </div>
              </div>
            </div>
          </section>
          <div className="marketing-traits marketing-container">
            <div>
              <HandHeart aria-hidden="true" />
              <span>
                Familiar, from
                <br />
                the first hello
              </span>
            </div>
            <div>
              <Users aria-hidden="true" />
              <span>
                Family stays
                <br />
                connected
              </span>
            </div>
            <div>
              <Tablet aria-hidden="true" />
              <span>
                On the tablet
                <br />
                you already have
              </span>
            </div>
          </div>
        </div>
        <section
          id="companion"
          className="marketing-companion"
          aria-labelledby="companion-title"
        >
          <div className="marketing-container">
            <div className="section-heading centered">
              <p className="marketing-eyebrow">
                A little company. A lot of familiarity.
              </p>
              <h2 id="companion-title">
                A familiar world,
                <br />
                just a tap away.
              </h2>
            </div>
            <div className="companion-panel">
              <CompanionPreview />
              <div className="companion-features">
                {features.map(({ icon: Icon, title, text }) => (
                  <article key={title}>
                    <Icon size={46} strokeWidth={1.2} aria-hidden="true" />
                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section
          id="how-it-works"
          className="marketing-how marketing-container"
          aria-labelledby="how-title"
        >
          <div className="section-heading split-heading">
            <h2 id="how-title">
              You add the
              <br />
              personal touch.
            </h2>
            <p>
              Set it up together.
              <br />
              Stay close from wherever you are.
            </p>
          </div>
          <ol className="marketing-steps">
            {steps.map((step, i) => (
              <li key={step.title}>
                <span className="step-number" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <div className="marketing-closing">
          <section
            id="questions"
            className="marketing-faq marketing-container"
            aria-labelledby="questions-title"
          >
            <div className="section-heading">
              <h2 id="questions-title">
                A few things
                <br />
                you might wonder.
              </h2>
              <a className="marketing-text-link" href="/contact">
                Ask us something else{" "}
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
            <div className="faq-list">
              {questions.map(({ question, answer }) => (
                <details key={question}>
                  <summary>
                    {question}
                    <Plus size={20} aria-hidden="true" />
                  </summary>
                  <p>
                    {answer}
                    {question === "Who can see our memories?" && (
                      <>
                        {" "}
                        <a href="/privacy">Read our privacy policy</a>.
                      </>
                    )}
                  </p>
                </details>
              ))}
            </div>
          </section>
          <section
            id="waitlist"
            className="marketing-waitlist marketing-container"
            aria-labelledby="waitlist-title"
          >
            <h2 id="waitlist-title">
              Be part of
              <br />
              the <em>beginning.</em>
            </h2>
            <div className="waitlist-content">
              <p>Get an email when early access opens.</p>
              <WaitlistForm />
              <p className="marketing-note">
                Early-access updates only. Unsubscribe any time.
              </p>
            </div>
          </section>
        </div>
      </main>
      <div className="marketing-footer-wrap">
        <Footer />
      </div>
    </div>
  );
}
