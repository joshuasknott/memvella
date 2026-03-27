# Frontend Data & Interaction Map

## 1. Data Submission (Forms & CTAs)

| Route | Field Name | Expected Type | Description / Notes |
|-------|------------|---------------|---------------------|
| **/onboarding/caregiver** | Caregiver Name | `string` | e.g., "Sarah" |
| | Loved One Name | `string` | e.g., "Mom" |
| | Email | `string` (email) | |
| | Password | `string` | |
| **/onboarding/independent** | Senior Name | `string` | e.g., "David" |
| | Email | `string` (email) | |
| | Password | `string` | |
| **/senior/setup** | Connect Code | `string` | 6-digit PIN used to pair the tablet |
| **/caregiver/add-person** | Photo | `file` (Image) | Uploaded via Camera interface |
| | Name | `string` | e.g., "David" |
| | Relationship | `enum` / `string` | "Son", "Daughter", "Grandchild", "Friend" |
| | Is Living Status | `boolean` | CRITICAL: Temporal safety flag to prevent hallucination of grief. True if living, False if deceased. |
| | AI Context Notes | `string` | Textarea for "Memvella Context" |
| **/caregiver/add-routine** | Routine Name | `string` | e.g., "Morning Tea" |
| | Time | `string` | e.g., "10:00 AM" |
| | Frequency | `enum` / `array` | "Daily", "Weekly", "Weekends" |
| | AI Instructions | `string` | Textarea for specific handling directions |
| **/caregiver/add-memory/text** | Memory Title | `string` | |
| | Date/Time | `string` | e.g., "Spring 2019" |
| | The Story | `string` | Textarea or dictated text |
| | Photo | `file` (Image) | Optional upload |
| **/caregiver/add-memory/audio**| Song Link | `string` (url) | Spotify or Apple Music Link |
| | Context | `string` | Why Mom loves this |
| | Audio/Video File | `file` (Media)| Fallback for direct uploads (.mp4, etc.) |
| **/caregiver/add-memory/voice**| Dictation Transcript| `string` | Captured from Tap to dictate |
| **/caregiver/add-memory/media**| Uploaded File | `file` (Media)| Camera roll selection |
| | The Story | `string` | Short context string |

## 2. Data Hydration (UI Rendering Requirements)

### `/caregiver` (Dashboard)
- **Status Summary:** Needs strings for high-level status (e.g., "Mom is doing well today.") and a descriptive subtitle.
- **AI Insights:** Requires an array/object of pending insights (e.g., "Memvella identified that Emily prefers Earl Grey...").
- **Today's Updates:** Needs an array of timeline events containing:
  - `time` (e.g., "10:00 AM" or "2:00 PM")
  - `type` / `iconType` (to render Coffee/Video/Heart icons)
  - `description` (e.g., "Morning Tea routine completed.")
  - `imageUrl` (optional, for photo-viewing events)

### `/caregiver/memories` (Family Directory)
- **Family Count:** Needs an integer representing the total number of added members.
- **Directory List:** Requires an array of family member objects to map over (currently displaying a No Data state), containing `name`, `relationship`, and `photoUrl`.

### `/senior` (Home Screen)
- **Senior Name:** Simple string for rendering "Good Afternoon, Mom" (derived from linked caregiver setup or independent setup).
- **Next Event/Update:** Needs a string representing the immediate next activity (e.g., "Emily is coming over for tea at 3:00 PM.").
- **Memory Gallery:** Requires an array of memory objects containing:
  - `imageUrl` (High resolution photo)
  - `caption` (Optional string, e.g., "David's graduation, 2019")

## 3. Application State & Interactive Triggers

### Voice Overlay (`/senior/voice`)
- **Trigger:** Initiated by clicking the massive "Tap to talk to Memvella" button on `/senior`.
- **Hydration Needed:** 
  - Real-time `transcriptionText` (e.g., *"When is Emily coming over?"*).
- **Triggers:** Clicking "End Chat" closes the overlay and triggers a backend action (`saveVoiceSessionLog`) to save the conversation log context.

### Notification Settings (`/caregiver/settings/notifications`)
Uses iOS-style switch toggles controlling three boolean states:
- `dailySummary` (boolean): Controls evening wrap-up alerts.
- `urgentAlerts` (boolean): Controls emergency fallback alerts.
- `routineReminders` (boolean): Controls ping alerts for completed/missed routines.

## 4. Required Backend Actions (Convex Hooks)

**Required Mutations:**
- `createCaregiverAccount` (name, lovedOne, email, password)
- `createSeniorAccount` (name, email, password)
- `pairTabletSession` (pinCode)
- `addFamilyMember` (name, relationship, isLiving, aiContext, photoStorageId?)
- `addRoutine` (name, time, frequency, aiInstructions)
- `addMemoryText` (title, date, story, photoStorageId?)
- `addMemoryAudio` (songLink, context, mediaStorageId?)
- `addMemoryVoice` (transcript)
- `addMemoryMedia` (mediaStorageId, story)
- `updateNotificationSettings` (dailySummary, urgentAlerts, routineReminders)
- `saveVoiceSessionLog` (transcript, duration)

**Required Queries:**
- `getCaregiverDashboardSummary` (Fetches the high-level connection sentiment)
- `getPendingAIInsights` (Fetches the "New Insights" review card data)
- `getTodayTimeline` (Fetches the chronological list of events for the Dashboard)
- `getFamilyDirectory` (Fetches the array of added relationships)
- `getSeniorNextEvent` (Fetches the prominent alert card on the tablet left column)
- `getMemoryGallery` (Fetches 5-10 recent or relevant photos for the Bento grid)
- `getNotificationSettings` (Fetches the user's boolean toggle configuration)
