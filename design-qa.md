# Memory dictation reliability — 12 September 2026

Current review: passed locally.

The shared memory editor now reconciles complete speech-result snapshots, preserves existing paragraph breaks, and ignores callbacks from completed or cancelled dictation attempts. Microphone startup is cancellable. Stop waits briefly for final words, then releases the editor even when the speech service omits its end event. Errors preserve the story and allow editing or another attempt. Waiting, listening, and finishing states are announced.

- All nine dictation browser tests passed, covering save/search, revised and withdrawn interim words, appending to edited text, startup cancellation, errors, retries, final results after Stop, stalled or throwing browser methods, and leaving the editor.
- The existing phone memory-editor and account-edit checks also passed. The first cold run exceeded the existing editor test's 60-second limit during page compilation; that case passed on its own rerun with a 120-second local limit, completing in 14.8 seconds. The narrow-screen check was repeated to inspect the actual viewport and keyboard focus.
- Inspected the editor at 1280px and 320px. The startup Cancel action remains reachable by keyboard, its focus ring is visible, status and error text are readable, and the narrow screen has no horizontal overflow. Captures: `output/dictation-improvement/dictation-starting-phone.png` and `output/dictation-improvement/dictation-error-desktop.png`. The initial full-page phone capture included an offscreen fixed skip link; the viewport capture confirms it does not obscure the controls.
- The repository verification phases passed: environment/public/copy guardrails, lint, type checks, 163 unit tests, and both production builds. Phases ran sequentially with pinned pnpm 9.0.0; unchanged lint/type-check tasks reused Turbo caches. Log: `output/dictation-improvement/verify.log`.
- Restored the existing local Convex data and temporary environment settings after browser testing. Before/after comparisons matched all 39 document exports and all remaining archive entries, including stored files. The Windows export CLI exited abnormally after downloading its snapshots; archive integrity and restored contents were checked independently.

The browser checks used local Convex and simulated speech events. They do not verify a physical microphone, speech-recognition accuracy, or live provider behavior. Changes remain local. Optional removal of the saved development cache was blocked by automatic approval review; the cache remains ignored under `.next/`.

---

# Memvella shared marketing identity — 5 September 2026

Current review: passed locally.

## Scope and visual source

Applied the marketing page's lavender/aubergine palette, Figtree headings, flower wordmark, rounded surfaces, and pill controls across the caregiver and Supporter routes, account/setup/recovery pages, and senior companion. Senior content retains Atkinson Hyperlegible and large controls. Personal content and backend authorization are unchanged. The welcome page reuses the existing illustrative marketing family photograph.

Three built-in imagegen boards were generated before implementation: `output/imagegen/marketing-alignment/caregiver.png`, `companion.png`, and `accounts-and-lists.png`. Their reference and prompt notes are in the adjacent README. The implemented layouts preserve existing product navigation and controls rather than adding incidental generated filters, online badges, or statistics.

## Evidence

- 68 fresh screenshots in `output/playwright/marketing-alignment/` cover desktop, phone, tablet, forms, details, settings, recovery, senior dialog states, and restricted Supporter views.
- The updated seven-screen review is served at `http://127.0.0.1:4175/?view=marketing-aligned`. All seven images were checked as loaded. `output/marketing-alignment/gallery.png` records the review gallery.
- Desktop and 390px captures report no horizontal overflow; additional 320px checks cover Today, memory editor, Settings, account creation, password recovery, pairing, and the senior screen.
- Visually inspected welcome, account creation, Today, memory editor, Settings, person detail, and senior landscape. The palette, wordmark, heading hierarchy, controls, and responsive surfaces match the marketing direction. Companion media remain fully framed.
- A temporary memory was created, opened, and deleted through its confirmation UI. Tablet pairing and memory navigation passed. Existing voice test controls verified the Ready dialog, Finish conversation, and simulated connection-error dismissal. The test mode returns Ready rather than live Listening; real microphone/service calls were not exercised.
- A disposable local Supporter account joined by invite. Its settings and owner-only tablet/routine restrictions were checked.

## Verification

`pnpm verify` passed: environment/public/copy checks, lint, type checks, 130 unit tests across 26 files, and both production builds. Some unchanged domain/backend results used Turbo's cache. Individual checks were also run with concurrency 1 after the first full run competed with local preview processes for memory. Final log: `output/marketing-alignment/verify-final.log`. Browser evidence and interaction logs are in the same folder. Diff whitespace check passed.

Local implementation and sample-data verification only. No deployment, push, external email, or live voice verification. Generated boards are references; product screens remain real components and CSS.

---
# Memvella marketing v2 — design QA

final result: passed

Reviewed 4 September 2026. Scope: the marketing homepage and its shared header/footer. The preceding application-overhaul report is preserved at `output/overhaul/design-qa.md`.

## Visual target and comparison

- Source: `output/marketing-v2/design-reference.png`, generated using built-in imagegen before implementation.
- Desktop: `output/marketing-v2/desktop.png`, 1440 × 1000 browser viewport (1425px content width with scrollbar), full page, default closed FAQ and dialog, empty signup form.
- Combined comparison: `output/marketing-v2/comparison.png`. Source and rendered page are normalized to 864px width and placed alongside each other without stretching height. This combined image was opened and visually reviewed.
- Focused evidence: `desktop-hero.png`, `mobile.png` (390 × 844), `narrow-phone.png` (320 × 740), `tablet.png` (820 × 1180), `mobile-dialog.png`, and `waitlist-success.png` in the same output folder.
- The implementation carries through lavender/plum colouring, large sans serif hierarchy, family-album photography, the floating routine reminder, the three-trait strip, a companion preview, three practical steps, FAQs, and a dark early-access panel.
- Intentional production adaptations: native accessible FAQ disclosures; a fourth privacy question and contact link; visible email label and error/success feedback; explicit example-preview caption and dialog; standard Lucide icons in place of generated icon shapes; independent generated photos; existing legal footer. The decorative botanical drawing is omitted. The layout is responsive rather than a raster reproduction.
- Remaining P3 differences: type metrics and section proportions differ modestly from the generated mockup. The companion is an illustrative interactive preview, not a claim to show a live account or live voice session.

## Comparison history and fixes

1. Initial desktop inspection found that the hero inherited a white main background instead of the reference lavender. Added an explicit intro background. The subsequent desktop capture and combined comparison show the correct lavender band.
2. Responsive review found the last headline line wrapping unnecessarily on the narrow phone and tablet, and a desktop step-divider rule surviving the mobile breakpoint. Added breakpoint-specific type sizes and a matching-specificity border override. Final 320px screenshot shows three deliberate headline lines; DOM confirms 37px type and 0px mobile divider. Tablet confirms 42.64px type.
3. The dev server served an outdated generated stylesheet after HMR. Stopped only the marketing process, preserved its generated dev cache under `.next/dev-before-marketing-v2-final`, and restarted. Fresh computed styles and captures confirm the actual fixes.
4. Restored the footer outside the main landmark. Final DOM and rendered colours were checked.

## Interaction and accessibility checks

- Main hero/header navigation reaches the companion and signup sections.
- Companion button opens a labelled native dialog. Close and Escape dismiss it; Escape restores focus to Tap to talk. Mobile dialog is readable and scrollable within the viewport.
- FAQ disclosure opens its associated answer. Native summary supports keyboard operation.
- Empty email submission shows the validation alert; configured server failure shows an honest error while keeping the form available.
- The local marketing server initially had no CONVEX_URL. Restarted it with process-local CONVEX_URL=http://127.0.0.1:3210, using the already running local backend.
- Submitted synthetic marketing-v2-preview@memvella.test through the real UI. POST /api/waitlist returned 200 and the UI displayed the successful signup state. No external email was sent.
- Privacy page loads; its header signup link returns to /#waitlist with the email field present.
- DOM checks found no horizontal overflow at 320, 390, 820, or 1440px browser widths. Primary controls are at least 44px. Inputs are labelled, dialog has a name, image alternatives are provided, focus is visible, and motion respects reduced-motion preferences.
- Final browser error log: empty. Earlier intentional unconfigured-server failure was resolved. Images report loaded with nonzero natural width.

## Code checks

- Marketing lint: passed.
- Marketing type check: passed.
- Marketing tests: 10 passed across 3 files.
- Marketing production build: passed; repeated after final responsive/landmark changes.
- Public, copy, environment contract checks: passed.
- Marketing diff whitespace check: passed.

## Boundaries and preview

Local implementation and local backend verification only. Production hosting and production waitlist configuration were not changed. Voice in the marketing preview is a labelled example; live microphone capture is intentionally absent. Existing core app changes and data were preserved.

Preview: http://127.0.0.1:3101/ . Local server left running. Image source prompts and saved asset paths are in `output/marketing-v2/image-generation.md`.
# Accessibility and conversation implementation, 5 September 2026

In progress toward the accessible working-product goal. Tablet pairing now accepts keyboard input and formatted paste. The companion has a text conversation path that skips microphone capture. Conversation dialogs use native modal behavior and completed-reply announcements. The live implementation now requests native audio with transcripts, encodes input as base64 PCM, schedules output PCM, and cancels queued playback on interruption. Calibrate's current Gemini integration informed the native-audio, transcript, and interruption approach; no Calibrate deployment or secrets were imported.

Verified locally: core type-check, lint, and production build; 27 core tests including worklet execution at 16/44.1/48 kHz, PCM wire encoding/decoding and playback cancellation. Browser checks at 320px confirmed formatted pairing input, no horizontal overflow, a simulated text response without microphone requests, native modality, Escape and focus restoration. Capture: `output/playwright/accessible-text-mobile.png`. The browser check used the existing local test server and did not reset existing local data.

Follow-up: removed the 30-second routine-response deadline; added microphone pause/resume and browser read-aloud/slower-reading controls. Conversation failures retain the previous reply, identify microphone denial, and ignore stale socket callbacks. The close action now stays outside the scrolling content. Browser interaction checks passed at 320px, with capture `output/playwright/accessible-reply-controls.png`. Axe 4.11.2 reported no WCAG A/AA violations in the scanned welcome, pairing, companion, Today, Memories, Routines, Settings, account creation, sign-in, password recovery, marketing homepage, and open text dialog states. These scans do not constitute complete accessibility conformance. Core tests now include the reader speed and total 28 passing tests; an existing dynamic-import production-guard test timed out on the first run and passed on rerun.

Integration follow-up: all 23 repository browser tests passed against the correctly configured local server, covering account and Supporter flows, permissions, pairing/revocation, media/audio uploads, memory editing/deletion, routines, People, review queues, settings and companion accessibility. An initial run exposed a manual-preview test-mode mismatch; the test health endpoint now rejects that configuration. Logs: `output/accessibility-verification/e2e-configured.log`. Before/after snapshots include authentication components and file storage. Restoration succeeded and hashes matched across all 36 compared document tables. The live close/reopen path now waits for cleanup and detaches the previous session before closing it. The repeatedly slow production-guard import was deferred until after its authorization guard; the existing production-rejection tests pass.

The full `pnpm verify` gate passed its guardrails, lint, type checks, 137 tests across 28 files and production builds (unchanged tasks may be cached); log: `output/accessibility-verification/verify.log`.

Conversation follow-up: optional tap-controlled turns now configure manual activity detection on both the constrained token and client. The microphone worklet flushes its final partial packet before acknowledging end-of-turn. Mobile interaction and axe checks passed for Start speaking / I’m finished (`output/playwright/manual-conversation.png`). Routine check-ins no longer confirm arbitrary speech: 12 cases cover affirmative, negative and ambiguous phrases. Core tests now total 42, including PCM flush ordering and manual configuration. These are local/simulated checks; provider-backed behavior remains unverified.

### Live service verification — 6 September 2026

- Gemini and Resend credentials are configured in local and hosted Convex. The hosted deployment is a development deployment, not an established production release. Its test-mode flag and test authentication token were removed and their absence verified.
- Resend verified `memvella.me`; all three required DNS records are saved in Cloudflare. Verification and password-reset emails were delivered to a local QA account using the owner's Gmail plus-address.
- With local backend email verification enforced, signup returned no session. Following the delivered verification link in the browser opened `/circle`. The real password-reset API accepted a valid reset token, rejected the old password afterwards, accepted the replacement password, and revoked the previous session. The reset token was read only from this local QA account's verification record; the browser password-reset form was not exercised. QA credentials remain in ignored local secret storage.
- The actual Next.js live-token route authenticated a local assisted session, issued a Gemini ephemeral token, received audio and a readable transcript, and saved the turn in Convex. Separate provider tests completed automatic text turns and manual audio turns with generated PCM input and returned input transcription and spoken replies. This does not verify a physical microphone or speaker.
- Found and fixed a provider failure: wrapping realtime text in manual audio activity markers closes Gemini with code 1007. Reminder prompts now send realtime text directly. The corrected text path completed against Gemini, including with manual activity detection enabled.
- Browser verification paired a companion through the real owner UI and completed three typed Gemini turns with client simulation disabled. Two replies ended with trailing incomplete clauses; a controlled one-sentence prompt returned a complete sentence. This quality issue needs further live investigation before launch. The duplicate text in the accessibility snapshot represents the visible reply and separate completed-reply live region.
- The complete `pnpm verify` gate exited successfully after the fix: guardrails, lint, type checks, unit tests (42 core, 97 backend, 10 marketing, plus the cached domain package), and both builds. Evidence: `output/accessibility-verification/verify-live-services.log`.
- Public `https://memvella.me` currently returns Cloudflare Tunnel error 1033. The existing Vercel `memory-mvp` project points to the old `memory-mvp` repository and an older deployment; it has not been repointed or deployed. The current repository is `joshuasknott/memvella`.

Vercel staging follow-up:

- Created separate `memvella-core` and `memvella-marketing` projects for the current monorepo. Explicit preview deployments both reached READY and their home pages returned HTTP 200 through authenticated Vercel access.
- Product preview: `https://memvella-core-puc1edhjd-joshuaknotts-projects.vercel.app`. Its test-health route returns 404. The hosted development backend's auth origins now point to this preview instead of localhost.
- Marketing preview: `https://memvella-marketing-oec013w6w-joshuaknotts-projects.vercel.app`. A QA waitlist submission through its deployed API returned HTTP 200 with `status: joined` against hosted Convex.
- Vercel automatically classified the initial deployments of the new projects as production when no target was supplied. The initial core build failed because only preview variables were configured. The initial marketing deployment succeeded on its Vercel hostname; its production waitlist environment was not configured. Subsequent deployments explicitly used `--target preview`. No custom-domain records were changed.
- Upload exclusions are recorded in `.vercelignore`. Deployment logs are under `output/accessibility-verification/vercel-*-preview*.log`. Preview environment settings are not a completed production configuration.

### Production deployment follow-up — 6 September 2026

- Committed and pushed the implementation to `main` as `6b18d3d` after the full verification gate passed.
- Inspected production Convex `animated-eel-659`: no existing tables or configured environment variables. Configured independent authentication secrets and existing working email/AI services, then deployed the backend after a successful dry run. Development data was not migrated or changed.
- Both Vercel production builds reached READY. The product uses the production Convex cloud/site endpoints and `https://app.memvella.me` as its auth origin. Marketing uses the production Convex waitlist endpoint.
- Replaced the unavailable root Cloudflare tunnel record with Vercel DNS and added the `app` and `www` CNAME records. Preserved Resend's DNS records. Vercel verified the `www` DNS configuration.
- Public HTTPS requests to `https://memvella.me` and `https://app.memvella.me` returned 200. The production test-health route returned 404. A production waitlist submission returned `status: joined`; a nonexistent-account sign-in returned the expected 401 invalid-credentials response. Real production account verification and paired-device checks still require an account.
- A direct SDK test reproduced an incomplete final clause with Gemini reporting both generation completion and turn completion; two other direct turns completed normally. This rules out the page as the sole cause and leaves response completeness unresolved. Provider transcript ordering is documented at https://ai.google.dev/api/live.
- Deployment evidence is under `output/accessibility-verification/*production*.log`; credentials and browser artifacts remain ignored.

Still required: physical microphone/speaker testing; conversation completeness and reconnect/resumption review; assistive-technology, browser password-reset, and service-backed notification coverage. Deployment success is not complete production journey or accessibility certification.

## Product reliability and everyday usability — 12 September 2026

Reviewed the routine editor, paginated memory library, notification switches, tablet recovery, waitlist states, and public-page metadata using the existing design system. Evidence and the coverage inventory are in `output/product-improvement/`.

- Owner routine editing, pause/resume persistence, and deletion passed at 375px. The native delete dialog initially focuses Keep routine; Escape restores focus to Delete routine. Visual inspection caught a checkbox inheriting full-width text-input styling and overflowing the phone layout; the final selector excludes checkboxes.
- Memory search found a word beyond the card preview in an older record. A separate local review created 26 memories, loaded the first 24, used Load more to reach all 26, searched the oldest story, and recovered from no results. Today displayed only its three requested cards. Phone search and empty states were checked at 320px; populated library and Today were inspected at 1440px.
- Notification switches have accessible names, 44px targets, visible focus, and persisted keyboard changes. `notification-focus-phone.png` records the focused Daily summary switch.
- Offline testing preserves tablet pairing and announces potentially stale information. Browser network events supplement the socket state because an offline browser can keep an existing socket marked connected. Preparation failure offers a retry; visual inspection caught a general button rule overriding its intended size, and the final retry target measures at least 72px. Tablet states were inspected at 1024 × 768.
- Waitlist checks covered invalid input and focus, loading, HTTP 429, malformed success payloads, non-JSON failures, the 15-second timeout, retry, and a successful signup saved to the local backend. Errors preserved the email field; success received focus. Phone states were inspected at 320px and success at 1440px. No email was sent.
- Home, Contact, Privacy, and Terms returned their own canonical URLs, the shared social image, and the configured response headers. Robots, sitemap, and image URLs returned successfully. The secondary-page skip link moved keyboard focus to the main landmark. Marketing review recorded no browser page errors.

Functional evidence: all 35 repository Chromium scenarios passed across the initial run and focused reruns after fixes. The reminder test now seeds an already-due occurrence instead of relying on the old replay of a midnight reminder. The two additional visual-review scenarios passed; the core review was repeated after the final retry-button correction. The unavailable interactive browser kernel was replaced with the repository's Playwright runtime for this pass. These checks do not establish assistive-technology conformance.

The updated schema and functions were pushed only to the local Convex backend. The search backfill completed for four existing memories, and the real local renewal function queued an active schedule successfully. Existing local data was backed up before testing, restored to the migrated baseline afterward, and compared: all 39 document tables and 50 other export entries matched. Original local environment values were restored, and the test servers were stopped.

The disk filled while Next.js persisted development output. One generated Turbo cache archive from this session was removed, freeing about 2.2 GB. Production cache outputs now exclude `.next/dev*` directories so future archives do not include development data and preserved dev caches. The final core production cache archive measured 5,768,453 bytes (about 5.8 MB), compared with the removed 2,245,641,105-byte archive.

Final repository verification passed: environment/public/copy guardrails, all lint and type-check tasks, 190 tests across 31 files, and both production builds. These were fresh runs, recorded in `output/product-improvement/verify.log`; final diff whitespace validation also passed. Changes remain local. Production release must deploy the backend and complete the memory search backfill before the updated frontend, as documented in `docs/launch-runbook.md`. Live Gemini, email delivery, web push, physical tablet hardware, and production journeys were not reverified in this pass.
