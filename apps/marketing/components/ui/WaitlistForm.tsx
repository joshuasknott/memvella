"use client";

import React, { useEffect, useRef, useState } from "react";
import { normalizeWaitlistEmail } from "@/lib/waitlist-submission";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const successMessage = useRef<HTMLDivElement>(null);
  const requestController = useRef<AbortController | null>(null);

  useEffect(() => () => requestController.current?.abort(), []);
  useEffect(() => {
    if (status === "success") successMessage.current?.focus();
  }, [status]);

  function validateEmail(value: string): boolean {
    if (!normalizeWaitlistEmail(value)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError(null);
    return true;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) validateEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requestController.current) return;
    if (!validateEmail(email)) {
      emailInput.current?.focus();
      return;
    }

    setStatus("loading");
    setMessage(null);
    const controller = new AbortController();
    requestController.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sourcePath: window.location.pathname }),
        signal: controller.signal,
      });
      const payload: unknown = await response.json();

      if (response.status === 429) {
        setStatus("error");
        setMessage(
          "The waitlist is busy right now. Please try again in a few minutes.",
        );
        return;
      }
      if (
        !response.ok ||
        typeof payload !== "object" ||
        payload === null ||
        !("status" in payload) ||
        !["joined", "already_joined", "rejoined"].includes(
          String(payload.status),
        )
      ) {
        throw new Error(
          "Memvella could not save your request. Please try again.",
        );
      }

      setStatus("success");
      setMessage(
        payload.status === "already_joined"
          ? "This email is already on the waitlist. We will be in touch when access opens."
          : "You are on the waitlist. We will reach out when new access opens.",
      );
    } catch {
      setStatus("error");
      setMessage(
        controller.signal.aborted
          ? "This is taking longer than expected. Please check your connection and try again."
          : "Memvella could not save your request. Please try again.",
      );
    } finally {
      window.clearTimeout(timeout);
      requestController.current = null;
    }
  };

  if (status === "success") {
    return (
      <div
        ref={successMessage}
        tabIndex={-1}
        role="status"
        className="waitlist-success"
      >
        {message}
      </div>
    );
  }
  return (
    <div>
      <form
        noValidate
        method="post"
        action="/api/waitlist"
        onSubmit={handleSubmit}
        className="waitlist-form"
        aria-busy={status === "loading"}
      >
        <label htmlFor="waitlist-email">Email address</label>
        <input
          ref={emailInput}
          id="waitlist-email"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={254}
          placeholder="Your email address"
          value={email}
          onChange={handleChange}
          disabled={status === "loading"}
          aria-invalid={!!emailError}
          aria-describedby={emailError ? "waitlist-email-error" : undefined}
        />
        <button
          type="submit"
          className="marketing-button"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Saving your place…" : "Join the waitlist"}
        </button>
      </form>
      {emailError ? (
        <p id="waitlist-email-error" role="alert" className="waitlist-error">
          {emailError}
        </p>
      ) : null}
      {status === "error" && message ? (
        <p role="alert" className="waitlist-error">
          {message}
        </p>
      ) : null}
    </div>
  );
}
