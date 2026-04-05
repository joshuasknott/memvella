# Current State Audit

Status: historical audit snapshot
Scope: entire repository
Date: 2026-04-05

This audit compares canonical docs, shipped code, repo tooling, and the current app surface.

This file captures the priority list that drove the remediation work started on 2026-04-05. Treat the root canonical docs as the source of truth for the current state after that remediation.

The priorities below are ordered by user impact and implementation risk, not by how easy they are to fix.

## Verification Snapshot

- `pnpm build` passed for both apps.
- `pnpm lint` passed with 15 warnings in `apps/core`.
- `pnpm type-check` completed without running any package tasks.
- No automated test runner config or test files were found during the audit.

## Priority List

1. Independent onboarding is internally broken and no longer matches the documented auth contract.

Severity: High.
Category: `codebase vs codebase`, `codebase vs documentation`, `missing parts`.
Why it matters: the current entry flow looks like an SMS/OTP onboarding, but the backend and follow-up pages still depend on the older email magic-link bootstrap. The user can complete the mock UI and still land on `/independent` without a valid senior session.
Evidence: `docs/auth-and-identity.md:45-56`; `docs/auth-and-identity.md:60-63`; `apps/core/design.md:88-90`; `apps/core/app/onboarding/independent/page.tsx:74-76`; `apps/core/app/onboarding/independent/page.tsx:147-149`; `apps/core/app/onboarding/independent/page.tsx:163-173`; `apps/core/app/onboarding/independent/verify/page.tsx:67-70`; `apps/core/app/onboarding/independent/verify/page.tsx:103-145`; `apps/core/app/independent/recover/page.tsx:47-69`; `apps/core/app/independent/page.tsx:249-250`; `apps/core/convex/independentAuth.ts:114-235`.
Recommended direction: pick one real path and finish it end to end. Either restore the documented email magic-link onboarding or fully implement the SMS-first flow, then remove the dead branch.

2. Member accounts currently inherit organiser-level access across the family-side app and backend.

Severity: High.
Category: `codebase vs codebase`, `missing parts`.
Why it matters: `member` exists in the schema, but the shared `family_side` gate grants member access to organiser surfaces such as invite generation, tablet pairing, routines, memories, and notification management. The UI also redirects a newly joined member straight into the organiser/supporter workspace.
Evidence: `apps/core/convex/familySpaceAuth.ts:13-20`; `apps/core/convex/familySpaceAuth.ts:31-35`; `apps/core/convex/familySpaceAuth.ts:120-122`; `apps/core/app/onboarding/member/MemberJoinClient.tsx:321-323`; `apps/core/app/onboarding/member/MemberJoinClient.tsx:432-455`; `apps/core/app/supporter/layout.tsx:24-33`; `apps/core/lib/use-family-space-profile.ts:8-19`; `apps/core/convex/familyInvites.ts:162-225`; `apps/core/convex/kiosk.ts:175-238`; `apps/core/convex/kiosk.ts:241-264`; `apps/core/convex/routines.ts:20-74`; `apps/core/convex/memories.ts:66-200`; `apps/core/convex/notifications.ts:190-309`; `apps/core/proxy.ts:4-29`.
Recommended direction: define the actual `Member` permission model, enforce it in Convex helpers, and stop routing every family-side role into a purely organiser-branded workspace.

3. Canonical docs still say Join a Circle / Member onboarding is not implemented, but the repo now ships that flow.

Severity: High.
Category: `codebase vs documentation`, `documentation vs documentation`.
Why it matters: onboarding, auth, testing, and product docs all present different states of the same feature. Engineers cannot tell whether Member onboarding is missing, partial, or already live.
Evidence: `docs/product.md:38`; `docs/product.md:67-68`; `docs/auth-and-identity.md:39-42`; `docs/auth-and-identity.md:131`; `docs/testing.md:55`; `apps/core/design.md:48-59`; `apps/core/app/page.tsx:24-32`; `apps/core/app/onboarding/member/MemberJoinClient.tsx:142-237`; `apps/core/app/onboarding/member/MemberJoinClient.tsx:245-346`; `apps/core/app/supporter/settings/invite/page.tsx:149-155`; `apps/core/app/supporter/settings/invite/page.tsx:224-233`; `apps/core/convex/familyInvites.ts:162-225`; `apps/core/convex/familyInvites.ts:228-339`.
Recommended direction: update the canonical docs to describe the real current state: backend implemented, UI implemented, permissions still incomplete.

4. Canonical docs still say the data model does not distinguish Organiser and Member, but the schema and onboarding code do.

Severity: High.
Category: `codebase vs documentation`, `documentation vs documentation`.
Why it matters: auth and schema work now depends on a role split that some canonical docs still deny exists.
Evidence: `docs/product.md:71`; `docs/auth-and-identity.md:33`; `docs/auth-and-identity.md:79`; `docs/auth-and-identity.md:132`; `docs/terminology.md:27-30`; `docs/data-model.md:17`; `docs/data-model.md:73`; `apps/core/convex/schema.ts:13-24`; `apps/core/components/organiser/OrganiserProfileBootstrap.tsx:32-37`; `apps/core/convex/familyInvites.ts:317-323`.
Recommended direction: make one canonical statement about current role storage, migration status, and remaining permission gaps, then reuse that statement instead of duplicating partial summaries.

5. The marketing app root is incomplete or undocumented: metadata declares `/`, but there is no root page or rewrite.

Severity: Medium.
Category: `codebase vs codebase`, `missing parts`.
Why it matters: the marketing app currently builds only `/waitlist`, while metadata claims canonical `/`. If this app is deployed at the domain root without an external rewrite, the homepage is missing.
Evidence: `apps/marketing/app/layout.tsx:15-17`; `apps/marketing/next.config.ts:1-5`; `apps/marketing/app` contains only `globals.css`, `layout.tsx`, and `waitlist/`; `apps/marketing/app/waitlist/page.tsx:1-295`.
Recommended direction: either add `apps/marketing/app/page.tsx`, add an explicit rewrite/redirect, or document that `/waitlist` is the intended only route.

6. The marketing surface still ships placeholder UX and unsupported product claims.

Severity: Medium.
Category: `codebase vs documentation`, `codebase vs codebase`.
Why it matters: the waitlist form fakes success, several CTA and footer links do nothing, visible design placeholders remain in the page, and the page claims an independent user can invite family members even though no such product path exists in the shipped app.
Evidence: `docs/product.md:70`; `docs/testing.md:51-57`; `apps/marketing/design.md:24-25`; `apps/marketing/design.md:37-39`; `apps/marketing/components/ui/WaitlistForm.tsx:13-23`; `apps/marketing/app/waitlist/page.tsx:17-23`; `apps/marketing/app/waitlist/page.tsx:74-75`; `apps/marketing/app/waitlist/page.tsx:167-169`; `apps/marketing/app/waitlist/page.tsx:189-190`; `apps/marketing/app/waitlist/page.tsx:230-235`; `apps/marketing/app/waitlist/page.tsx:287-289`; `apps/core/app/independent` contains only `page.tsx`, `recover/`, and `error.tsx`; `apps/core/convex/familyInvites.ts:162-225`.
Recommended direction: make the page honestly placeholder, or finish the real routes and integration it implies.

7. Active product logic still depends on the legacy `familyMembers` compatibility table.

Severity: Medium.
Category: `codebase vs documentation`, `codebase vs codebase`.
Why it matters: canonical data-model guidance says not to build net-new product features on compatibility tables, but the live app still writes and reads `familyMembers` for Add Profile, dashboard counts, AI onboarding actions, and senior voice context.
Evidence: `docs/data-model.md:52-68`; `apps/core/convex/schema.ts:156-160`; `apps/core/convex/organiser.ts:91-115`; `apps/core/convex/organiser.ts:382-410`; `apps/core/convex/organiser.ts:433-468`; `apps/core/convex/aiActions.ts:75-98`; `apps/core/convex/voiceHelpers.ts:75-83`; `apps/core/convex/voiceHelpers.ts:124-129`.
Recommended direction: either move these features to a canonical table or update docs to explicitly acknowledge `familyMembers` as an active dependency until a migration exists.

8. The verification and tooling story is misleading.

Severity: Medium.
Category: `codebase vs codebase`, `missing parts`.
Why it matters: `pnpm type-check` currently gives a false sense of safety because no package defines a `type-check` task, there are no automated tests, the root `clean` script is Unix-specific in a Windows repo, and lint includes generated Convex output that the docs say should not be treated as source material.
Evidence: `README.md:33-38`; `README.md:55-57`; `docs/testing.md:10-57`; `package.json:5-12`; `apps/core/package.json:5-10`; `apps/marketing/package.json:5-10`; `turbo.json:14-19`; `apps/core/eslint.config.mjs:8-15`; `apps/marketing/eslint.config.mjs:8-15`.
Recommended direction: add real `type-check` scripts, define an automated test baseline, make `clean` cross-platform, and ignore generated Convex files in lint.

9. The documentation set is missing a canonical local-development and onboarding matrix.

Severity: Medium.
Category: `missing parts`, `documentation vs documentation`.
Why it matters: setup instructions are fragmented. The README describes `.env.local` setup, but `docs/env.md` adds an important Convex-runtime requirement. The docs also do not give a clear matrix for persona, entry route, auth mechanism, current status, or expected local URLs.
Evidence: `README.md:24-38`; `docs/product.md:26-50`; `docs/auth-and-identity.md:17-75`; `docs/env.md:10-40`; `docs/architecture.md:10-30`; `apps/core/design.md:44-59`.
Recommended direction: add one canonical matrix covering role, route, auth method, backend owner, implementation status, and test expectations.

10. Terminology migration is still incomplete in user-visible copy and route/module naming.

Severity: Low.
Category: `codebase vs documentation`, `codebase vs codebase`.
Why it matters: the canonical role set is `Organiser`, `Member`, `Tablet User`, and `Independent User`, but the repo still exposes `supporter` routes/modules, uses `Assisted Senior` and `Independent Senior` in UI, and marketing copy still says `loved one`.
Evidence: `README.md:7`; `docs/terminology.md:18-23`; `docs/terminology.md:32-48`; `apps/core/next.config.ts:4-25`; `apps/core/proxy.ts:4-29`; `apps/core/app/supporter/settings/page.tsx:86-91`; `apps/core/app/supporter/settings/account/page.tsx:38-39`; `apps/core/app/supporter/settings/account/page.tsx:109-135`; `apps/core/app/independent/recover/page.tsx:179-183`; `apps/marketing/app/waitlist/page.tsx:137`; `apps/marketing/app/waitlist/page.tsx:254`.
Recommended direction: keep legacy route/module names only where compatibility is required, but align new copy and active surfaces with the canonical terms.

11. The docs are internally fuzzy about what counts as legacy `supporter` debt versus a still-canonical implementation surface.

Severity: Low.
Category: `documentation vs documentation`.
Why it matters: `docs/terminology.md` says `supporter` should only survive as a legacy implementation detail, but `docs/data-model.md` still lists `supporterInsights` as a canonical table. That makes it unclear whether `supporter*` naming is debt to remove or an accepted stable contract.
Evidence: `docs/terminology.md:25-30`; `docs/data-model.md:43-57`; `apps/core/convex/schema.ts:440-477`; `apps/core/convex/README.md:15-18`.
Recommended direction: document which `supporter*` names are transitional and which are intentionally stable for now.

12. Some labels overpromise functionality.

Severity: Low.
Category: `codebase vs codebase`.
Why it matters: the settings IA says `Circle Members`, but that screen only generates and revokes invite codes. There is no actual member directory or member management surface there yet.
Evidence: `apps/core/app/supporter/settings/page.tsx:40-53`; `apps/core/app/supporter/settings/invite/page.tsx:149-155`; `apps/core/app/supporter/settings/invite/page.tsx:224-233`; `apps/core/app/supporter/settings/invite/page.tsx:255-297`.
Recommended direction: either rename the entry to reflect invite-code management or add the missing member management surface.

## Suggested Order Of Operations

1. Fix or revert the broken independent onboarding path.
2. Lock down `Member` permissions before expanding Member UX.
3. Reconcile canonical docs with the shipped Member flow and the current role model.
4. Decide whether marketing is a real routed app or a single `/waitlist` landing page.
5. Choose whether `familyMembers` remains active for a while or gets migrated out of the product path.
6. Repair the verification surface so `type-check`, lint, and testing provide trustworthy signals.
