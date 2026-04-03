# Frontend Routes & Layout Audit

This document provides a comprehensive map of the `app/` directory, routing structure, and global layouts for the Memvella application.

## 1. Directory & Route Map

The application uses standard Next.js App Router conventions. Key feature areas (`caregiver`, `senior`) are implemented as standard nested routes, **not** Route Groups.

```text
app/
├── api/                    # Backend API routes
├── caregiver/              # Caregiver Dashboard (Standard Route)
│   ├── add-memory/
│   ├── add-person/
│   ├── add-routine/
│   ├── insights/
│   ├── memories/
│   ├── routines/
│   ├── settings/
│   ├── signin/
│   ├── layout.tsx          # Mobile-first shell with Header & Bottom Nav
│   └── page.tsx            # Caregiver Landing/Dashboard
├── onboarding/             # Initial Setup Flows
│   ├── caregiver/          # Caregiver-led onboarding
│   └── independent/        # Self-setup onboarding
├── senior/                 # Senior Kiosk Interface (Standard Route)
│   ├── setup/              # Connection code entry
│   ├── voice/              # AI Voice interaction interface
│   ├── layout.tsx          # Tablet landscape shell (Zero-Nav)
│   └── page.tsx            # Senior Tablet Home/Kiosk
├── favicon.ico
├── globals.css             # Tailwind & Global Styles
├── layout.tsx              # Root Layout (Fonts & Root Providers)
├── page.tsx                # Universal Splash / Entry Funnel
└── providers.tsx           # Client-side Provider definitions
```

---

## 2. Initial Load Experience (`app/page.tsx`)

The root `app/page.tsx` renders a **Universal Splash** screen. It does not perform an automatic redirect; instead, it presents a 3-button entry funnel to segment users immediately:

- **Button 1:** "I'm setting this up for someone I care for" → Links to `/onboarding/caregiver`
- **Button 2:** "I'm setting this up for myself" → Links to `/onboarding/independent`
- **Button 3:** "I have a 6-digit connection code" → Links to `/senior/setup`

---

## 3. Application Layouts & Providers

### Global Providers (`app/layout.tsx` & `app/providers.tsx`)
The `RootLayout` wraps the entire application in the following providers:

- **`ConvexBetterAuthProvider`**: (Defined in `providers.tsx`)
  - Wraps the app logic with Convex real-time database capabilities.
  - Integrates with `BetterAuth` via `authClient` for unified authentication.
  - Uses `ConvexReactClient` connected to `NEXT_PUBLIC_CONVEX_URL`.

### Layout Hierarchies
- **Root Layout (`app/layout.tsx`)**: Sets up global fonts (**Plus Jakarta Sans** for body, **Lexend** for headlines) and common CSS classes.
- **Caregiver Layout (`app/caregiver/layout.tsx`)**:
  - Implements a mobile-optimized container (max-width 448px/`max-w-md`).
  - Includes a persistent `CaregiverHeader` and `CaregiverBottomNav`.
  - Content area is padded (`pt-24 pb-24`) to avoid overlap with fixed navigation elements.
- **Senior Layout (`app/senior/layout.tsx`)**:
  - Implements a "Zero-Navigation" philosophy.
  - Full-screen landscape view (`h-screen w-screen overflow-hidden`).
  - Intentionally hides navigation to minimize cognitive load for seniors.

---

## 4. Senior Voice Interface (`app/senior/voice/page.tsx`)

A dedicated route exists for AI-driven voice interaction.

- **Primary Purpose:** To provide a low-friction, conversational interface for seniors to interact with Memvella.
- **Key Features:**
  - **State Machine:** Manages states for `idle`, `recording`, `processing`, and `speaking`.
  - **Voice Capture:** Uses the Web Speech API (`SpeechRecognition`) for real-time local transcription.
  - **AI Logic:** Sends transcripts to the Convex action `api.voice.handleVoiceChat` which likely processes the intent via an LLM.
  - **Text-to-Speech:** Uses `window.speechSynthesis` to read responses back to the senior.
  - **Accessibility:** Large, high-contrast typography and a massive central mic toggle (256px button).
  - **Aesthetics:** Uses a blurred photo gallery background for a personalized, calming feel.
