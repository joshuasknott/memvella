import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Tablet } from "lucide-react";

export default function WelcomePage() {
  return (
    <main className="welcome-page">
      <div className="welcome-copy">
        <Link className="circle-wordmark" href="/" aria-label="Memvella home">
          Memvella
        </Link>
        <div className="welcome-intro">
          <p className="eyebrow">Familiar moments. Everyday connection.</p>
          <h1>
            A little closer,
            <br />
            every day.
          </h1>
          <p>
            Share the memories they know. Bring a gentle rhythm to their day.
            Stay connected through a simple companion tablet.
          </p>
          <Link
            href="/onboarding/organiser"
            className="action-button"
            id="btn-start-circle"
          >
            Get started <ArrowRight size={20} aria-hidden="true" />
          </Link>
          <p className="welcome-signin">
            Already here?{" "}
            <Link href="/organiser/signin" id="btn-join-circle">
              Log in
            </Link>
          </p>
          <Link href="/onboarding/member" className="quiet-link">
            I have an invite code <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <Link
          href="/assisted/login"
          id="link-connect-tablet"
          className="welcome-tablet"
        >
          <Tablet size={20} aria-hidden="true" /> Connect a companion tablet
        </Link>
      </div>
      <div className="welcome-photo">
        <Image
          src="/images/seaside-memory.png"
          alt="Two generations enjoying a walk beside the sea"
          fill
          sizes="(min-width: 900px) 50vw, 100vw"
          preload
          className="object-cover"
        />
        <div className="welcome-caption">
          <p>
            The small moments.
            <br />
            The familiar feeling.
          </p>
          <span>More room for what matters.</span>
        </div>
      </div>
    </main>
  );
}
