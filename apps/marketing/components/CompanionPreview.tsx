"use client";

import Image from "next/image";
import { Coffee, Heart, Mic, X } from "lucide-react";
import { useRef } from "react";

export function CompanionPreview() {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <div className="companion-preview">
      <div
        className="companion-screen"
        aria-label="Example companion tablet for Margaret"
      >
        <div className="preview-greeting">
          <span>Good afternoon,</span>
          <strong>Margaret</strong>
        </div>
        <div className="preview-content">
          <div className="preview-memory">
            <Image
              src="/images/garden-memory-v2.webp"
              alt="A sunny garden with a table set for tea"
              fill
              sizes="(min-width: 761px) 350px, 64vw"
            />
            <div>
              <strong>Sundays in the garden</strong>
              <span>From James · 12 May 2024</span>
            </div>
            <Heart size={18} fill="currentColor" aria-hidden="true" />
          </div>
          <div className="preview-routine">
            <span>Next up</span>
            <Coffee size={34} strokeWidth={1.2} aria-hidden="true" />
            <strong>Tea in the garden</strong>
            <span>3:00 pm</span>
          </div>
          <button
            className="preview-talk"
            onClick={() => dialog.current?.showModal()}
            aria-haspopup="dialog"
          >
            <Mic size={22} aria-hidden="true" />
            Tap to talk
          </button>
        </div>
      </div>
      <p className="preview-caption">
        A glimpse of the companion. Tap to explore.
      </p>
      <dialog
        ref={dialog}
        className="companion-dialog"
        aria-labelledby="preview-dialog-title"
      >
        <button
          className="dialog-close"
          aria-label="Close companion preview"
          onClick={() => dialog.current?.close()}
        >
          <X size={22} aria-hidden="true" />
        </button>
        <p className="marketing-eyebrow">Meet the companion</p>
        <h2 id="preview-dialog-title">Start with something familiar.</h2>
        <div className="example-conversation">
          <span>Example conversation</span>
          <p>“Tell me about Sundays in the garden.”</p>
          <p>
            “James shared a photo of your garden. What did you enjoy growing
            there?”
          </p>
        </div>
        <p>
          On the companion tablet, one tap starts a voice conversation, with the
          memories your family has shared close at hand.
        </p>
        <p className="marketing-note">
          This website preview doesn’t use your microphone.
        </p>
        <a
          href="#waitlist"
          className="marketing-button"
          onClick={() => dialog.current?.close()}
        >
          Join the waitlist
        </a>
      </dialog>
    </div>
  );
}
