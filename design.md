# Memvella: Global Design & Accessibility System

**Version:** 1.1
**Core Philosophy:** Radical cognitive accessibility, digital wellness, and multi-sensory empowerment.

## 🤖 AI Agent Instructions

When generating, refactoring, or styling any frontend component, you MUST read and strictly adhere to the rules in this document. Always check which user flow (Supporter, Assisted Senior, or Independent Senior) the component belongs to and apply the respective logic and layout rules.

---

## 1. Global Brand & Terminology Tokens

### 1.1 Strict Terminology (Digital Wellness Boundary)

Memvella is a digital wellness companion, NOT a medical device.

- **BANNED WORDS:** Care, caregiver, care circle, patient, sufferer, dementia, loved one.
- **REQUIRED WORDS:** Supporter, Organizer, Connections, Support Network, Wellness Space, Companion.
- **Greeting Rule:** Never use hardcoded relational greetings. Always use dynamic variable interpolation (e.g., `Hello, {user.firstName}`).

### 1.2 Color Palette

Gradients are reserved exclusively for the SVG logo and non-interactive branding elements. ALL interactive elements MUST use flat, high-contrast solid colors.

- **Background (Global):** Soft Cream / Off-White (`#FCFCF9` or `bg-slate-50`).
- **Primary Action (Deep Purple):** `#6B21A8` (`bg-purple-800`). Used for primary CTAs (e.g., "Tap to Talk").
- **Secondary Action (Cool Blue):** `#1D4ED8` (`bg-blue-700`). Used for secondary buttons and Supporter dashboard icons.
- **Text (High Contrast):** Deep Charcoal `#1A1A1A` (`text-gray-900`).

### 1.3 Typography

- **Font Family:** Highly legible, sans-serif (e.g., `font-sans`, Inter, Roboto).
- **Minimum Sizes:** Body text must never fall below `18px` (`text-lg`) on mobile and `22px` (`text-xl`) on tablet viewports.

---

## 2. Profile A: The Supporter Flow (Utility & Efficiency)

_Target User: Highly capable, often stressed, requiring high information density and fast automation. Primary Device: Mobile Phone._

- **Layout Structure:** Clean, card-based UI floating on the off-white global background.
- **The "No Invisible Scroll" Rule:** Onboarding and critical forms MUST be constrained using `min-h-[100dvh]` and flexbox. Primary submit buttons must be anchored above the mobile keyboard safe area.
- **Action Density:** Use standard mobile patterns. Inline CRUD actions (Edit/Delete) should be revealed via tap or hover states on data cards to save screen real estate.
- **Information Architecture:** Mandatory inputs (e.g., "Who are we supporting?") must always precede security inputs (e.g., Email).

---

## 3. Profile B: The Assisted Senior Flow (Receiver Mode)

_Target User: Seniors experiencing moderate cognitive decline. Relying on tablet devices. Requires absolute zero cognitive overload and no configuration._

- **Zero Autonomy / Read-Only:** This user does not configure settings, create accounts, or type. Authentication is strictly via a 6-digit PIN input.
- **Hick’s Law (Paradox of Choice):** A single screen must only ask the user to do ONE thing. Never present more than two interactive buttons simultaneously. There are no hamburger menus or hidden settings.
- **Temporal Anchoring:** The top 15% of the dashboard must persistently display the user's name, current time, day of the week, and date (`sticky top-0`).
- **Literal UI:** No abstract icons. Every icon must be paired with highly legible text (e.g., `[Mic Icon] Tap to Talk`).
- **The Hero Microphone:** The "Tap to Talk" interface is for _recalling_ and _conversing_. It must be massive (min `72x72px`) with 4 distinct visual states: Idle, Listening, Processing, and Speaking.

---

## 4. Profile C: The Independent Senior Flow (Creator Mode)

_Target User: Seniors experiencing very early cognitive decline. Relying on tablet or mobile. Requires autonomy and empowerment disguised as simplicity._

- **Frictionless Authentication:** Zero passwords allowed. Onboarding relies strictly on Magic Links (Email/SMS) immediately followed by a prompt to enable Biometric Auth (FaceID/TouchID).
- **Conversational CRUD:** This user has the power to create routines and memories, but MUST NOT be subjected to complex forms. All data entry should be routed through the "Tap to Talk" voice interface (e.g., they speak their routine, the AI parses and saves it).
- **Forgiving Error Recovery:** Because they are creating data, they must be able to easily undo mistakes. Provide massive, explicit, solid-colored "Undo," "Back," or "Cancel" buttons. Never rely on native device gestures (like swipe-to-go-back).
- **Confirmation States:** If the AI extracts a routine from their voice, the UI must present a clear, high-contrast confirmation state ("I set a reminder for your medication at 9 AM. Is this correct? [Yes] [No]").

---

## 5. UI Component Checklists

**Before committing any frontend code, verify:**

- [ ] Are there zero instances of the word "care" or "loved one"?
- [ ] Does the screen fit within `100dvh` without hiding critical buttons?
- [ ] Are senior touch targets at least `72px` wide/tall?
- [ ] Are all interactive buttons solid colors (no gradients)?
