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
