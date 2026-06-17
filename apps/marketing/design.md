# Marketing Design

Status: canonical
Scope: apps/marketing
Last reviewed: 2026-04-04
Owners: product, engineering
Read when: touching the marketing site, waitlist, metadata, or landing-page copy
Depends on: docs/product.md, docs/terminology.md

## Core Principle

The marketing app can be more expressive than the product app, but it still needs to feel grounded in the real product. Do not let visual flourish outrun product truth.

## Shared Brand Rules

- Use the same overall color family and typography language as the core product.
- Memvella is a digital wellness companion, not a medical device.
- Prefer specific, believable language over vague visionary claims.
- Keep role and product terminology aligned with `docs/terminology.md`.

## Marketing-Specific Rules

- Marketing pages can use richer composition, layered backgrounds, and more expressive motion than `apps/core`.
- Primary calls to action must map to a real route or a clearly documented placeholder.
- Do not leave draft placeholders, exports, or design-tool artifacts in committed source when a production page is meant to be live.
- Metadata should either be intentionally set or intentionally blank, never left as framework defaults.
- The marketing app should be structured so the homepage and secondary pages can grow without rebuilding the shell or navigation each time.

## Copy Guardrails

- Do not claim unsupported onboarding paths as though they are already shipped.
- If a feature is directional rather than implemented, describe it carefully.
- Avoid creating a second vocabulary for the same role or flow.
- Use `Workspace`, `Supporter`, and `companion tablet` consistently when marketing copy refers to product roles.
- Present Memvella as one home and family-led support product: Supporters set up a Workspace, and the senior gets a calm companion tablet experience.

## Conversion Guardrails

- Waitlist or signup forms should document whether they are real or placeholder.
- If a form is mock-only, do not present it as a production-backed pipeline in engineering docs.
- CTA labels should be consistent across hero, footer, and supporting sections.
- If the waitlist is live, submit to a real backend destination and handle repeat submissions honestly.
