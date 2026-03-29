# Memvella Authentication & Pairing Audit

This document details the dual-layer authentication architecture of Memvella: **Better Auth** for caregivers and **PIN-based Pairing** for seniors.

---

## 1. Caregiver Authentication (Better Auth)

### Enabled Providers & Methods
- **Email & Password**: Currently the primary authentication method.
- **Configuration**: Managed in `convex/auth.ts` via the `betterAuth` factory.
- **Provider Settings**: `requireEmailVerification` is set to `false`, allowing immediate access upon signup.
- **Plugins**: Uses the `@convex-dev/better-auth/plugins` `convex` plugin to ensure JWT compatibility with Convex's backend.

### User Creation Lifecycle
1.  **Auth Signup**: When a user registers via the frontend `authClient`, Better Auth validates the credentials.
2.  **Database Insertion**: The `authComponent.adapter(ctx)` (linked to the `@convex-dev/better-auth` component) creates a user record within the component's internal tables (`users`, `accounts`, etc.).
3.  **Identity Derivation**: Convex generates a `tokenIdentifier` for the user (e.g., `https://convex.dev|...`).
4.  **Profile "Flush"**: After the initial signup, the frontend is expected to call the `createCaregiverProfile` mutation (in `convex/caregiver.ts`). 
    - This mutation is **idempotent**.
    - It creates an application-level record in the `caregiverProfiles` table.
    - It links the record to the auth identity via the `authUserId` field.
    - It hydrates the profile with the `lovedOneName` (typically retrieved from `localStorage` where it was stored during the onboarding questionnaire).

### Session Management
- **Token Minting**: Better Auth mints session tokens during successfully authenticated flows.
- **Next.js Integration**: The `convexBetterAuthNextJs` handler in `lib/auth-server.ts` provides the `handler` for `app/api/auth/[...all]/route.ts`, enabling session persistence across the frontend.
- **Convex Synchronization**: The `convexClient` plugin on the client-side `authClient` ensures that the Convex React client is aware of the authentication state, allowing queries to use `ctx.auth.getUserIdentity()`.

---

## 2. Senior Authentication (The Kiosk Pairing Flow)

The Senior Tablet (Kiosk) operates on a **Zero-Navigation Philosophy**, meaning seniors are never required to manage credentials.

### Device Pairing Mechanics
1.  **PIN Generation**: An authenticated caregiver calls `generateKioskPin` (`convex/kiosk.ts`).
    - This generates a random 6-digit numeric code.
    - It deactivates any previous active devices for that caregiver.
    - It stores a record in the `kioskDevices` table.
2.  **Senior Pairing**: The senior (or a helper) enters the 6-digit PIN on the tablet.
3.  **Validation**: The `pairTabletSession` mutation (publicly accessible) looks up the PIN:
    - If valid and `isActive`, it updates the `lastActiveAt` heartbeat.
    - It returns the `caregiverId` (the tokenIdentifier of the parent account).

### Kiosk "Sessions"
- **State Persistence**: The kiosk frontend stores the returned `caregiverId` string in its local application state (React state or localStorage).
- **Data Access**: Kiosk-specific queries (e.g., `getMemoryGallery`, `getSeniorNextEvent`) are **Public Queries**.
- **Auth Pattern**: Instead of a JWT, these queries require the `caregiverId` as a manual argument. The backend filters all returned data by this ID.
- **Security Control**: The caregiver can calling `deactivateKioskDevice` at any time to set `isActive: false`, which will cause the kiosk to lose data access once its local state expires or the board refreshes.

---

## 3. Notable Architectures & Placeholders

### ID Stability
The system uses the `tokenIdentifier` string as the "Single Source of Truth" for identity across both Better Auth and the Kiosk system. This avoids reliance on mutable Convex document IDs for cross-table linking.

### Roles
The `role` field in `caregiverProfiles` (currently `v.literal("caregiver")` or `v.literal("senior")`) acts as a placeholder for potential multi-user scenarios, though the current Kiosk implementation sidesteps this by using a pure token-based lookup rather than a full auth user.

### Heartbeats
The `lastActiveAt` field in `kioskDevices` is currently used as a basic heartbeat within the `pairTabletSession` flow. There is a placeholder for more advanced device monitoring in a future phase.
