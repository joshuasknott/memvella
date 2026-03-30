# Senior Routing & Component Audit

## 1. Current State: Directory Tree

Based on the audit of the `app/` and `components/` directories, here is the current structure:

```text
├── app/
│   ├── api/
│   │   └── auth/
│   ├── caregiver/
│   │   ├── add-memory/
│   │   ├── add-person/
│   │   ├── add-routine/
│   │   ├── insights/
│   │   ├── memories/
│   │   ├── routines/
│   │   ├── settings/
│   │   ├── signin/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── onboarding/
│   │   ├── caregiver/
│   │   │   └── page.tsx      (Organizer Magic Link Setup)
│   │   └── independent/
│   │       └── page.tsx      (Independent Senior Magic Link & Voice Setup)
│   └── senior/
│       ├── setup/
│       │   └── page.tsx      (Assisted Senior PIN Pairing)
│       ├── layout.tsx
│       └── page.tsx          (The current shared Senior Dashboard)
├── components/
│   ├── BrandLogo.tsx
│   ├── CaregiverBottomNav.tsx
│   ├── CaregiverHeader.tsx
│   ├── Toggle.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── FormCard.tsx
│       └── Input.tsx
```

## 2. The Tangle: Shared Logic and Architecture Risks

The primary structural risk is that **two entirely different authentication and usage models converge onto a single route (`/senior`)**. 

*   **The Convergence Point:**
    *   `app/senior/setup/page.tsx` handles the 6-digit PIN pairing for the *Assisted Senior* and then redirects to `/senior`.
    *   `app/onboarding/independent/page.tsx` handles the Magic Link/Biometric setup for the *Independent Senior* and upon completion, also redirects to `/senior`.
*   **State & Auth Bleed in `app/senior/page.tsx`:** 
    *   The `app/senior/page.tsx` dashboard is currently tailored for the read-only, local-storage-driven Assisted Senior (reading `memvella_organizerId` to bypass full session auth). 
    *   If an Independent Senior with a full JWT session lands here, the app currently lacks the logic to differentiate their capabilities. It does not conditionally render the routine-creation tools the Independent Senior needs.
*   **Onboarding Domain Confusion:** The `app/onboarding/` directory splits between `caregiver` and `independent`, but leaves the `assisted` onboarding inside the `app/senior/setup/` domain. This causes an inconsistent routing tree where "setup" and "onboarding" are treated differently.

## 3. UI Components to Abstract

Several massive UI features are currently hardcoded directly into the route pages. To cleanly split the Assisted and Independent flows, the following components must be extracted into the `/components` folder:

1.  **Memory Gallery (`MemoryGallery.tsx`)**
    *   *Where it is now:* Inline within `app/senior/page.tsx` (lines ~150-227), rendering the Bento-style gallery grid, polaroid rotation logic, and skeleton loaders.
    *   *Why abstract it:* Both the Assisted tablet and the Independent Senior dashboard will need to render this gallery.
2.  **Voice Microphone Input (`VoiceInput.tsx` / `VoiceModal.tsx`)**
    *   *Where it is now:* Duplicated and fragmented. `app/senior/page.tsx` has an inline Voice Modal Overlay (lines ~229-254) using CSS animations. `app/onboarding/independent/page.tsx` has a highly complex, inline Speech Recognition engine, state machine, and input pill (lines ~31-94, ~251-294).
    *   *Why abstract it:* The Independent Senior flow relies heavily on voice for creating routines. This complex `SpeechRecognition` logic and UI pill must be a globally reusable component so it can be deployed on their dashboard without copy-pasting code.
3.  **Numpad / Keypad (`Numpad.tsx`)**
    *   *Where it is now:* Hardcoded inside `app/senior/setup/page.tsx` (lines ~110-141).
    *   *Why abstract it:* If PIN-based authentication is ever reused (e.g., for unlocking settings, Caregiver quick-switching, or specific assisted routines), the massive 3x4 grid rendering logic should be its own modular component.

## Summary

The current architecture incorrectly funnels a highly capable, authenticated user (Independent Senior) and a read-only, pairing-code user (Assisted Senior) into the exact same `/senior` bucket, while scattering their shared visual components across deep nested route arrays.
