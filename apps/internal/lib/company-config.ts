export const companyConfig = {
  mission:
    "Build thoughtful technology that helps older adults keep independence, dignity, connection, memory, routines, and family coordination in reach.",
  stage: "Founder-operated product buildout",
  operatingPrinciples: [
    "Protect older adults and families from unnecessary complexity.",
    "Keep product roles explicit: Organiser, Member, Tablet User, Independent User.",
    "Prefer aggregate and metadata-first internal visibility.",
    "Treat trust, privacy, and accessibility as product quality, not afterthoughts.",
  ],
  priorities: [
    {
      title: "Companion product readiness",
      detail:
        "Keep Circle, assisted tablet, independent setup, routines, memories, voice, alerts, insights, and notifications coherent.",
    },
    {
      title: "Privacy-safe company visibility",
      detail:
        "Use HQ to understand product and company health without exposing personal stories, transcripts, evidence, or secrets.",
    },
    {
      title: "Growth signal quality",
      detail:
        "Track waitlist and first-party demand signals honestly before adding external analytics or partnership tooling.",
    },
    {
      title: "Operational resilience",
      detail:
        "Surface failures, queues, test readiness, release checklists, and runbooks before adding production actions.",
    },
  ],
  milestones: [
    "Internal HQ v1: founder mission control and department routing",
    "Core product privacy review and terminology pass",
    "Assisted tablet and independent user smoke coverage expansion",
    "Notification reliability review",
    "Waitlist and launch-readiness checkpoint",
  ],
  readinessChecklist: [
    { label: "HQ founder access is isolated from product roles", status: "done" },
    { label: "HQ read models are token-gated and read-only", status: "done" },
    { label: "Sensitive user content is hidden from dashboards", status: "done" },
    { label: "Runbooks exist for primary operating areas", status: "done" },
    { label: "External observability provider selected", status: "not_started" },
    { label: "Team roles beyond founder defined", status: "future" },
  ],
  risks: [
    {
      title: "Internal access surface",
      posture:
        "Founder-only cookie session and separate HQ access key in v1; later work should add team identity and audit logs.",
    },
    {
      title: "Sensitive product context",
      posture:
        "Dashboards show labels, counts, statuses, and timing only. Raw content reveal is intentionally deferred.",
    },
    {
      title: "Observability gap",
      posture:
        "First-party appEvents exist for sanitized signals. External provider integrations are not represented as live.",
    },
  ],
  privacyPosture: [
    "No user impersonation.",
    "No production mutations from HQ v1.",
    "No raw memories, People AI context, voice transcripts, Alert evidence, or Insight evidence.",
    "No secrets, hashes, passkey credentials, invite hashes, pairing hashes, or push auth values.",
    "Circle, senior profile, and item names are hidden by default behind generated labels.",
  ],
  productPortfolio: [
    {
      name: "Memvella companion product",
      status: "First major product",
      scope:
        "Voice-first digital wellness companion for Circle, Tablet User, and Independent User experiences.",
    },
    {
      name: "Future elder-tech products",
      status: "Placeholder",
      scope: "HQ is structured to add products without turning product support into the whole company view.",
    },
  ],
  researchFoundations: [
    "Design for cognition, confidence, and low-friction recall.",
    "Keep accessibility and plain-language review close to product decisions.",
    "Separate lived experience learning from medical claims.",
    "Prefer interviews, usability notes, and support learnings over invented metrics.",
  ],
  accessibilityPrinciples: [
    "High contrast, large targets, simple hierarchy, and predictable flows.",
    "Voice-first creation should have explicit confirmation and rejection states.",
    "Avoid hidden navigation on senior-facing surfaces.",
    "Support family-side workflows with dense but readable status views.",
  ],
  growthChannels: [
    { name: "Waitlist", status: "live_first_party_signal" },
    { name: "Founder outreach", status: "manual_foundation" },
    { name: "Partnerships", status: "future_placeholder" },
    { name: "Content and learning library", status: "future_placeholder" },
  ],
  automationRoadmap: [
    "Expose existing scheduled worker health.",
    "Add safe job run history when background job records exist.",
    "Add provider usage and cost summaries only after integrations exist.",
    "Keep autonomous production actions out of HQ until role, audit, and approval flows exist.",
  ],
};

export const departmentLinks = [
  { href: "/company", title: "Company", detail: "Mission, stage, priorities, risks, and readiness." },
  { href: "/product", title: "Product", detail: "Companion product health, Circle metadata, and safe detail pages." },
  { href: "/growth", title: "Growth", detail: "Waitlist, demand signals, and future channel foundations." },
  { href: "/research", title: "Research", detail: "Elder-tech learning, accessibility, and discovery backlog." },
  { href: "/operations", title: "Operations", detail: "Notifications, push, sessions, pairing, and warnings." },
  { href: "/trust-safety", title: "Trust & Safety", detail: "Alert and Insight queue metadata and review boundaries." },
  { href: "/voice-ai", title: "Voice & AI", detail: "Intent, draft, safety-boundary, and processing metadata." },
  { href: "/observability", title: "Observability", detail: "Sanitized app events and provider extension points." },
  { href: "/qa", title: "QA / Dev", detail: "Environment readiness and guarded test support." },
  { href: "/automation", title: "Automation", detail: "Scheduled work visibility and future job foundations." },
  { href: "/runbooks", title: "Runbooks", detail: "Operational procedures and boundaries." },
];
