# Frontend Wiring & Convex Integration Audit

This document maps the connections between the Memvella frontend and the Convex backend, including session management and AI/Voice orchestration.

## 1. Convex Hook Usage Map

The frontend utilizes standard Convex React hooks (`useQuery`, `useMutation`, `useAction`) to interact with the backend.

### Queries (`useQuery`)
- **`api.kiosk.getSeniorNextEvent`**: Fetches the next scheduled event for the Senior dashboard (`app/senior/page.tsx`).
- **`api.kiosk.getMemoryGallery`**: Fetches the photo gallery for the Senior dashboard (`app/senior/page.tsx`).
- **`api.caregiver.getCaregiverProfile`**: Retrieves the caregiver's personal details and "loved one" name (`app/caregiver/page.tsx`, `add-person/page.tsx`).
- **`api.caregiver.getCaregiverDashboardSummary`**: Fetches high-level status for the caregiver home screen (`app/caregiver/page.tsx`).
- **`api.caregiver.getTodayTimeline`**: Retrieves today's schedule for both the dashboard and the routine list.
- **`api.caregiver.getFamilyDirectory`**: Lists all family members/contacts for memory mapping.
- **`api.caregiver.getNotificationSettings`**: Retrieves user preferences for alerts.

### Mutations (`useMutation`)
- **`api.kiosk.pairTabletSession`**: Couples a Senior tablet to a Caregiver account via a 6-digit PIN (`app/senior/setup/page.tsx`).
- **`api.kiosk.generateKioskPin`**: Generates a new pairing code in the Caregiver settings.
- **`api.caregiver.addFamilyMember`**: Creates a new family profile with AI context and photo.
- **`api.caregiver.addRoutine`**: Adds a new scheduled task/reminder.
- **`api.memories.generateUploadUrl`**: Provides a temporary URL for direct photo uploads to Convex storage.
- **`api.memories.addMemory[Text|Media|Voice|Audio]`**: Saves specific memory types to the database.

### Actions (`useAction`)
- **`api.voice.handleVoiceChat`**: Orchestrates the AI response for the senior voice interface (`app/senior/voice/page.tsx`). It takes a text transcript and returns an AI-generated response.

---

## 2. Voice & AI Implementation

The application employs a **Client-Side Transcription** strategy for voice interaction.

- **Transcription Engine:** Uses the **native browser Web Speech API** (`SpeechRecognition` / `webkitSpeechRecognition`).
- **Third-Party Libraries:** **None.** No external voice packages (e.g., `react-speech-recognition`) are used.
- **Interaction Flow:**
  1. The user taps the mic and speaks.
  2. The browser's native API performs real-time transcription locally on the client.
  3. The final text transcript is sent to the `api.voice.handleVoiceChat` Convex action.
  4. The AI response is returned as text and read aloud using the browser's native `window.speechSynthesis` (Text-to-Speech).

---

## 3. Senior Session Management

The pairing between the Senior Tablet and the Caregiver's data is managed via **Local Storage persistence**.

- **Mechanism:** `localStorage` on the tablet device.
- **Stored Keys:**
  - `memvella_caregiverId`: The unique ID of the caregiver account this tablet is paired with.
  - `memvella_seniorName`: The name of the senior (used for greetings and AI context).
- **Security Context:** The senior kiosk operates in a "paired-only" mode. It does not require a `BetterAuth` session on the tablet itself; instead, it uses the persisted `caregiverId` as a key for public (but restricted) kiosk queries.

---

## 4. Pending Integrations

- **`handleOnboardingInput` Action:** The newly developed backend action for conversational onboarding is currently **not imported or used** anywhere in the `app/` directory. The onboarding flow (`app/onboarding/caregiver/page.tsx`) still relies on standard form inputs.
