# Architectural Compliance Audit: Senior & Supporter Flows

## Overview
This report evaluates the frontend architectures of the **Assisted Senior**, **Independent Senior**, and **Supporter** workflows against the strict accessibility and digital wellness tokens defined in `design.md`.

---

### 1. The "No Invisible Scroll" Rule (Constraint to `100dvh`)

*   **File:** `app/onboarding/supporter/page.tsx`
    *   **Offending Line:** `67: <div className="flex flex-col min-h-screen bg-surface px-6 ...`
    *   **Violation:** Uses `min-h-screen` instead of `min-h-[100dvh]`. On mobile devices, `vh` or `screen` can push critical actions below the bottom nav bar, causing invisible scrolling.
    *   **Fix Required:** Change `min-h-screen` to `min-h-[100dvh]`.

*   **File:** `app/assisted/login/page.tsx`
    *   **Offending Line:** `63: <main className="flex min-h-screen w-full flex-col...`
    *   **Violation:** Same as above; fails to use the dynamic viewport height constraint.
    *   **Fix Required:** Change `min-h-screen` to `min-h-[100dvh]`.

*   **File:** `app/onboarding/independent/page.tsx`
    *   **Offending Line:** `56: <div className="h-screen w-screen flex flex-col items-center justify-center...`
    *   **Violation:** Strict `h-screen` is used, causing mobile clipping.
    *   **Fix Required:** Change `h-screen w-screen` to `min-h-[100dvh] w-full` (or simply `min-h-[100dvh]`).

---

### 2. Senior Touch Targets (Min 72x72px)

*   **File:** `components/shared-senior/VoiceInputPill.tsx`
    *   **Offending Line:** `128: className="h-14 w-14 rounded-full...`
    *   **Violation:** Tailwind `h-14 w-14` is only 56px by 56px, directly failing the 72px strict minimum.
    *   **Fix Required:** Update to `h-[72px] w-[72px]` (or `h-20 w-20` for 80px).

*   **File:** `components/shared-senior/VoiceModal.tsx`
    *   **Offending Line:** `29: className="mt-8 bg-error text-white font-bold text-xl py-4 px-12...`
    *   **Violation:** The "Stop Recording" button is lacking explicit height guarantees to ensure cognitive accessibility.
    *   **Fix Required:** Add `min-h-[72px]` to the class list to ensure a massive absolute touch boundary.

*(Note: `Numpad.tsx` and `MemoryGallery.tsx` were reviewed and correctly utilize massive buttons exceeding the `72x72px` minimum.)*

---

### 3. Color & Gradients (Solid High-Contrast Only)

*   **File:** `app/assisted/page.tsx`
    *   **Offending Line:** `124: className="block text-center bg-linear-to-br from-primary to-secondary w-full...`
    *   **Violation:** The Hero "Tap to Talk" button uses a visual gradient, heavily violating the flat, solid high-contrast requirement.
    *   **Fix Required:** Replace `bg-linear-to-br from-primary to-secondary` with `bg-primary` (or `bg-[#6B21A8]`).

*   **File:** `components/shared-senior/VoiceInputPill.tsx`
    *   **Offending Line:** `131: : 'bg-linear-to-r from-[#4e0078] to-[#7a2e9e] text-white shadow-md active:scale-95'`
    *   **Violation:** Background gradient applied. 
    *   **Fix Required:** Replace gradient syntax with `bg-[#6B21A8]` (or global `bg-primary`).

*   **File:** `components/shared-senior/VoiceModal.tsx`
    *   **Offending Line:** `22: <div className="relative h-24 w-24 rounded-full bg-linear-to-r from-[#4e0078] to-[#7a2e9e] text-white...`
    *   **Violation:** Background gradient applied to the inner circle containing the microphone icon.
    *   **Fix Required:** Replace gradient syntax with a solid `bg-[#6B21A8]`.

---

### 4. Hick's Law (Assisted Flow)

*   **File:** `app/assisted/page.tsx`
    *   **Status: PASS**
    *   **Notes:** The main screen successfully limits choices by isolating the "Tap to talk to Memvella" button as the only primary call-to-action on the interface. The flow itself correctly limits the user to a singular primary interaction at all times.

---

### 5. Temporal Anchoring (Persistent Headers)

*   **File:** `app/assisted/page.tsx`
    *   **Offending Line:** `79: <section className="w-full md:w-[40%] flex-none flex flex-col justify-between p-4 md:p-12...`
    *   **Violation:** The left column is essentially in the static document flow for Mobile viewports. When the user scrolls down through the Memory Gallery on a phone or portrait-oriented tablet, the Name, Time, and Date scroll entirely out of view, breaking cognitive spatial grounding.
    *   **Fix Required:** Implement a `sticky top-0 z-40 bg-[#f8f5fa]` localized header boundary specifically for the timestamp/user variables on mobile viewports.

*   **File:** `app/independent/page.tsx`
    *   **Offending Line:** `90: <section className="w-full md:w-[40%] flex-none flex flex-col justify-between p-4 md:p-12...`
    *   **Violation:** Identical architectural flaw as the Assisted flow. The temporal anchoring gets lost under vertical scroll.
    *   **Fix Required:** Wrap the Name, Time, and Date in a `sticky top-0 z-40 bg-[#f8f5fa] pb-4` boundary so that it remains visible and anchored despite vertical scrolling.
