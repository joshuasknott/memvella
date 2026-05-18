export type Runbook = {
  slug: string;
  title: string;
  owner: string;
  summary: string;
  sections: Array<{
    title: string;
    items: string[];
  }>;
};

export const runbooks: Runbook[] = [
  {
    slug: "product-health",
    title: "Product Health",
    owner: "Founder",
    summary: "Check the companion product without opening sensitive user content.",
    sections: [
      {
        title: "Signals",
        items: [
          "Review Circle, senior profile, routine, memory, People, session, Alert, Insight, and voice metadata.",
          "Confirm counts are bounded where HQ says they are bounded.",
          "Use Circle detail pages for operational metadata only.",
        ],
      },
      {
        title: "Boundaries",
        items: [
          "Do not reveal raw memories, People context, transcripts, Alert evidence, or Insight evidence.",
          "Do not impersonate Organisers, Members, Tablet Users, or Independent Users.",
        ],
      },
    ],
  },
  {
    slug: "growth-waitlist",
    title: "Growth And Waitlist",
    owner: "Founder",
    summary: "Read demand signals from first-party waitlist data.",
    sections: [
      {
        title: "Review",
        items: [
          "Check total and recent waitlist counts.",
          "Review source path and referrer-domain breakdowns.",
          "Use redacted email display only for dedupe and sanity checks.",
        ],
      },
      {
        title: "Do Not",
        items: [
          "Do not add external tracking before there is a clear purpose and privacy review.",
          "Do not export full email lists through HQ v1.",
        ],
      },
    ],
  },
  {
    slug: "notification-failures",
    title: "Notification Failures",
    owner: "Operations",
    summary: "Handle push and notification delivery failure metadata.",
    sections: [
      {
        title: "Check",
        items: [
          "Review failed, skipped, queued, and sent delivery counts.",
          "Check push permission mix and active subscription count.",
          "Look for repeated failures on the same redacted Circle label.",
        ],
      },
      {
        title: "Boundaries",
        items: [
          "Do not expose push endpoints, p256dh, auth values, or request payloads.",
          "Do not add revoke or resend production tools in HQ v1.",
        ],
      },
    ],
  },
  {
    slug: "voice-ai-problems",
    title: "Voice And AI Problems",
    owner: "Product",
    summary: "Inspect voice and AI health using metadata-only views.",
    sections: [
      {
        title: "Review",
        items: [
          "Check interaction volume, intent mix, unknown intent count, and AI processing status.",
          "Review distress and medical-boundary flags as product safety metadata only.",
          "Check draft save counts for memory and routine flows.",
        ],
      },
      {
        title: "Boundaries",
        items: [
          "Do not show transcripts or assistant responses in HQ v1.",
          "Do not frame flags as diagnosis, treatment, or clinical judgement.",
        ],
      },
    ],
  },
  {
    slug: "tablet-session-issues",
    title: "Tablet And Session Issues",
    owner: "Operations",
    summary: "Diagnose assisted and independent session health without exposing tokens.",
    sections: [
      {
        title: "Check",
        items: [
          "Review senior session active, expired, and revoked mix.",
          "Check assisted pairing pin status mix.",
          "Use Circle detail to understand last session metadata.",
        ],
      },
      {
        title: "Boundaries",
        items: [
          "Do not expose session token hashes, device fingerprint hashes, pairing hashes, or recovery codes.",
          "Do not add production session reset controls in HQ v1.",
        ],
      },
    ],
  },
  {
    slug: "trust-safety-review-boundaries",
    title: "Trust And Safety Review Boundaries",
    owner: "Founder",
    summary: "Keep reviews privacy-first and non-clinical.",
    sections: [
      {
        title: "Review",
        items: [
          "Use status, priority, type, age, created timing, and reviewed timing.",
          "Track oldest queued item and queue mix.",
          "Escalate product boundary issues through human review outside HQ v1 when needed.",
        ],
      },
      {
        title: "Language",
        items: [
          "Use Alert, Insight, safety-boundary metadata, and review boundary.",
          "Avoid diagnosis, treatment, clinical triage, and risk-score framing.",
        ],
      },
    ],
  },
  {
    slug: "deployment-release-checklist",
    title: "Deployment And Release Checklist",
    owner: "Engineering",
    summary: "Pre-release checks for product and HQ changes.",
    sections: [
      {
        title: "Automated Checks",
        items: ["Run lint, type-check, tests, and build.", "Run focused browser smoke for changed surfaces."],
      },
      {
        title: "Manual Checks",
        items: [
          "Confirm env variables are set in the target environment.",
          "Confirm HQ is inaccessible unless enabled and authenticated.",
          "Confirm no secrets or sensitive content appear in bundles or dashboards.",
        ],
      },
    ],
  },
  {
    slug: "incident-checklist",
    title: "Incident Checklist",
    owner: "Founder",
    summary: "A lightweight incident response sequence for v1 operations.",
    sections: [
      {
        title: "First Pass",
        items: [
          "Identify affected surface and environment.",
          "Capture timing, visible symptoms, and sanitized error codes.",
          "Check observability, operations, voice, and runbook links before acting.",
        ],
      },
      {
        title: "Communication",
        items: [
          "Use plain, factual wording.",
          "Do not speculate about personal data or health outcomes.",
          "Document follow-up actions after the system is stable.",
        ],
      },
    ],
  },
  {
    slug: "research-accessibility-principles",
    title: "Research And Accessibility Principles",
    owner: "Product",
    summary: "Guide elder-tech learning without medical claims.",
    sections: [
      {
        title: "Principles",
        items: [
          "Prioritize dignity, independence, connection, memory, and routines.",
          "Test language, navigation, and voice flows with older-adult needs in mind.",
          "Treat feedback as learning, not as clinical evidence.",
        ],
      },
    ],
  },
  {
    slug: "privacy-redaction-policy",
    title: "Privacy And Redaction Policy",
    owner: "Founder",
    summary: "What HQ may and may not show.",
    sections: [
      {
        title: "Allowed",
        items: [
          "Aggregate counts, bounded counts, generated labels, statuses, timing, and sanitized message codes.",
          "Redacted email display for recent waitlist sanity checks.",
        ],
      },
      {
        title: "Not Allowed",
        items: [
          "Raw memories, People AI context, voice transcripts, Alert evidence, Insight evidence, secrets, hashes, tokens, passkey material, push auth values, and full email exports.",
        ],
      },
    ],
  },
  {
    slug: "hq-access-environment-setup",
    title: "HQ Access And Environment Setup",
    owner: "Engineering",
    summary: "Configure Memvella HQ safely.",
    sections: [
      {
        title: "Required Variables",
        items: [
          "Set MEMVELLA_HQ_ENABLED=1 to enable HQ.",
          "Set MEMVELLA_HQ_ACCESS_KEY for founder login.",
          "Set MEMVELLA_HQ_COOKIE_SECRET to a strong signing secret.",
          "Set MEMVELLA_HQ_READ_TOKEN in both internal app and Convex runtime.",
          "Set NEXT_PUBLIC_CONVEX_URL for the server-side Convex HTTP client.",
        ],
      },
      {
        title: "Policy",
        items: [
          "Product Organiser and Member access does not grant HQ access.",
          "HQ v1 is read-only and founder-only.",
        ],
      },
    ],
  },
];

export function getRunbook(slug: string) {
  return runbooks.find((runbook) => runbook.slug === slug) ?? null;
}
