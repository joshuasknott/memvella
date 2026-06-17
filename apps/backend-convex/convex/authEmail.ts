type AuthEmailKind = "password_reset" | "verification";

type AuthEmailArgs = {
  kind: AuthEmailKind;
  recipientEmail: string;
  recipientName: string;
  url: string;
};

export function isFamilyEmailVerificationRequired() {
  return process.env.MEMVELLA_TEST_MODE !== "1";
}

function requireAuthEmailEnv(name: "MEMVELLA_AUTH_EMAIL_FROM" | "RESEND_API_KEY") {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Auth email delivery is not configured. Set ${name}.`);
  }

  return value;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function buildAuthEmailContent(args: AuthEmailArgs) {
  const isVerification = args.kind === "verification";
  const subject = isVerification
    ? "Verify your Memvella email"
    : "Reset your Memvella password";
  const actionLabel = isVerification ? "Verify email" : "Reset password";
  const explanation = isVerification
    ? "Verify this email address to finish setting up your Memvella account."
    : "Use this secure link to choose a new password for your Memvella account.";
  const safeName = escapeHtml(args.recipientName.trim() || "there");
  const safeUrl = escapeHtml(args.url);

  return {
    subject,
    text: `Hello ${args.recipientName.trim() || "there"},\n\n${explanation}\n\n${args.url}\n\nIf you did not request this, you can ignore this email.`,
    html: `<p>Hello ${safeName},</p><p>${explanation}</p><p><a href="${safeUrl}">${actionLabel}</a></p><p>If you did not request this, you can ignore this email.</p>`,
  };
}

export async function sendMemvellaAuthEmail(args: AuthEmailArgs) {
  if (!isFamilyEmailVerificationRequired()) {
    return;
  }

  const apiKey = requireAuthEmailEnv("RESEND_API_KEY");
  const from = requireAuthEmailEnv("MEMVELLA_AUTH_EMAIL_FROM");
  const content = buildAuthEmailContent(args);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [args.recipientEmail],
      subject: content.subject,
      text: content.text,
      html: content.html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Auth email delivery failed with status ${response.status}.`);
  }
}
