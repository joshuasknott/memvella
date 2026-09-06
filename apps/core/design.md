# Core design

The family app centres on **Today, Memories, Routines, and Settings**. The companion tablet presents time, the next reminder, one memory, and one primary Talk action.

## Visual system

- Shared tokens: `packages/ui/src/globals.css`. App layouts: `apps/core/app/globals.css`.
- The marketing identity carries through every product route: pale lavender canvas (`#F5F1FA`), white surfaces, aubergine text and primary actions (`#30233D`), purple accents (`#71528C`), and lavender borders.
- Figtree body copy, headings, and lowercase flower wordmark; Atkinson Hyperlegible on the companion tablet. Family headings use medium weight and tight tracking, without a separate serif style.
- Panels use 20–28px corners, inputs 8–12px, and primary actions pill shapes. Use borders and space instead of nested cards, large shadows, gradients, or decorative status indicators.
- Use existing Lucide line icons. Decorative icons are hidden from assistive technology.
- Generated design boards: `output/imagegen/marketing-alignment/`. These reference the current marketing page. Images in welcome and marketing are illustrative; never populate real personal libraries with sample content.

## Layout and hierarchy

- Desktop: persistent left navigation, generous content width, three memory columns.
- Below 900px: top wordmark and fixed bottom navigation with safe-area padding. Never hide content behind navigation.
- Phones: one memory column and stacked Today sections. Headings wrap naturally; controls remain reachable at 320px.
- Today shows actual scheduled routines, companion access, and recent memories. A review notice appears only when the owner has queued items.
- Familiar people and review history live in Settings. Invitations are reached through Supporters.
- The routine list has one representation of each schedule. Creating a routine needs a name, time, and repeat days; additional notes are optional.
- One memory editor handles writing, dictation, media, and audio. Old format URLs are thin entry points to the same editor.
- One primary action per page. Avoid repeated calls to action and technical explanations of the implementation.

## Accessible interaction

- Family controls target 44px minimum, primary buttons 52px; senior controls 72px minimum, Talk 88px.
- Visible keyboard focus, labelled inputs, meaningful headings, `aria-current` on navigation, live save/error states, reduced-motion support.
- Voice dictation appends to existing words, allows editing after stopping, and offers typing when unavailable.
- Memory file previews are released on removal/unmount. Validation happens before upload.
- Companion photos remain fully in frame. Memories change only through explicit Previous/Next controls; no automatic rotation.
- Companion voice retains distinct connecting, listening, thinking, speaking, and error states. The dialog supports keyboard focus and scrolling on small screens.
- The companion offers Type a message alongside Tap to talk. Text conversations never request the microphone. Use the browser's modal dialog behavior for background isolation, Escape, and focus restoration; announce completed replies without announcing every streamed fragment.
- Tablet pairing uses a labelled, editable six-digit field supporting typing and formatted paste, alongside the large onscreen keypad.
- Loading never masquerades as zero content or a connected tablet.

## Auth and account

Welcome has one Get started action, a Log in link, an invite link, and quiet tablet pairing. Account creation remains one short form with verification. Auth pages share one responsive layout. Owner account details can be edited; tablet management lives only in its own settings page.

Before handoff, inspect desktop, phone, tablet, empty, populated, and error states. Run relevant browser interactions, keyboard checks, lint, type checks, and the repository verification gate. Record visual evidence in `design-qa.md`.
