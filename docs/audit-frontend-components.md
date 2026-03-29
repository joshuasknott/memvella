# Frontend Components & UI Audit

This document audits the UI architecture, component patterns, and responsive design strategies used in the Memvella application.

## 1. UI Architecture & Libraries

The application is built using **React 19** and **Tailwind CSS v4**, following a "raw" implementation approach rather than relying on a heavy component library.

- **Component Library:** **None.** The project does not use Shadcn UI, Radix UI, or Material UI.
- **Styling Engine:** **Tailwind CSS v4.** All UI elements (inputs, buttons, cards) are styled using utility classes.
- **Design System:** Custom design tokens are defined in the `@theme` block of `app/globals.css`, following a Material 3-inspired naming convention (e.g., `primary-fixed`, `surface-container-high`, `on-surface-variant`).
- **Icons:** **Lucide React** is the primary icon provider.

---

## 2. Caregiver Form Components

Caregiver forms (e.g., `app/caregiver/add-person/page.tsx`) are composed of artisanal components built with standard HTML elements:

- **Inputs & Textareas:** Standard `<input>` and `<textarea>` elements styled with large touch targets (`h-16`, `p-6`), rounded corners (`rounded-md`), and custom surface colors (`bg-surface-container-highest`).
- **Pill Selectors:** Custom button groups for relationship options and life status, using conditional Tailwind classes for active states (`bg-primary text-on-primary`).
- **Buttons:** Large, high-contrast action buttons (`bg-[#4e0078]`, `rounded-2xl`, `py-4`) with `active:scale-95` transitions for tactile feedback.
- **Photo Upload:** A custom hero section using a hidden file input and a styled `<label>` to create a large, accessible dropzone/upload area.
- **Toggles:** A custom `Toggle.tsx` component exists in the `components/` directory for boolean state changes.

---

## 3. Senior Kiosk Components

The Senior interface is designed as a high-visibility, low-friction "Zero-Navigation" dashboard.

### Live Clock Implementation
- **Component:** Found in `app/senior/page.tsx`.
- **Logic:** Uses a custom `useLiveClock` hook.
- **Implementation:** **Dynamic.** It uses a `useEffect` with a `setInterval` that updates the state every **60,000ms (1 minute)**. This ensures the clock remains accurate without unnecessary high-frequency re-renders.

### Dashboard Layout
- **Structure:** A split-screen layout using a `40%` left column (Time, Date, Next Event, Voice CTA) and a `60%` right column (Memory Gallery).
- **Memory Gallery:** A bento-style grid of "Polaroid" cards. Each card uses randomized or sequenced rotation classes (`-rotate-2`, `rotate-2`) and an `aspect-4/3` or `aspect-square` ratio to create a physical, scrapbooked feel.

---

## 4. Responsive Design Patterns

The application employs two distinct responsive strategies:

- **Caregiver Side (Mobile-First):**
  - The layout is locked to a mobile viewport width using `max-w-md mx-auto` in `app/caregiver/layout.tsx`.
  - This ensures a consistent "App-like" experience even when viewed on a desktop browser.
- **Senior Side (Tablet-Landscape):**
  - Uses percentage-based widths (`w-[40%]`, `w-[60%]`) for the primary columns.
  - Employs **Tailwind Breakpoints** (e.g., `md:text-8xl` in `voice/page.tsx`) to scale typography for larger screens.
  - The `SeniorLayout` uses `h-screen w-screen overflow-hidden` to prevent scrolling and maintain a fixed kiosk state.

---

## 5. Senior-Side Input Mechanisms

To minimize cognitive load and accessibility barriers, the senior interface avoids standard browser input fields.

- **Custom Keypad:** `app/senior/setup/page.tsx` uses a massive, custom-built 0-9 keypad for entering the 6-digit connection code. This bypasses the need for the native OS keyboard.
- **Voice Transcription:** `app/senior/voice/page.tsx` captures user input purely via voice using the Web Speech API. 
- **Standard Keyboard:** **Not utilized.** There are currently no components on the senior side that trigger the native system keyboard for text entry.
