"use client";

import React, { useState } from "react";
import { normalizeWaitlistEmail } from "@/lib/waitlist-submission";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

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
    if (!validateEmail(email)) return;

    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sourcePath: window.location.pathname }),
      });
      const payload = (await response.json()) as {
        status?: "joined" | "already_joined" | "rejoined";
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ?? "Memvella could not save your request.",
        );
      }

      setStatus("success");
      setMessage(
        payload.status === "already_joined"
          ? "This email is already on the waitlist. We will be in touch when access opens."
          : "You are on the waitlist. We will reach out when new access opens.",
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Memvella could not save your request.",
      );
    }
  };

  if (status === "success") {
    return (
      <div role="status" className="waitlist-success">
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
          id="waitlist-email"
          name="email"
          type="email"
          autoComplete="email"
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
