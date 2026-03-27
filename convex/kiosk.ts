import { mutation } from "./_generated/server";
import { v } from "convex/values";

// =============================================================================
// KIOSK — Tablet Pairing (Zero-Navigation Custom Auth)
// =============================================================================
// Senior tablets operate on a "Zero-Navigation" philosophy. Seniors NEVER
// type email addresses or passwords. Instead, a caregiver generates a 6-digit
// PIN which the senior (or a helper) enters once to pair the tablet.
//
// This is a pure lookup pattern — NOT a Better Auth flow. The result hydrates
// the kiosk's local state so it knows which senior it's serving.
// =============================================================================

// -----------------------------------------------------------------------------
// pairTabletSession
// -----------------------------------------------------------------------------
// Public mutation: no auth required — the senior is the caller.
//
// Args:  pinCode — the 6-digit code displayed in the caregiver app.
// Returns:
//   { success: true, caregiverId, seniorName } on a valid, active PIN
//   { success: false, error } on an invalid or inactive PIN
//
// Security notes:
//   - PIN lookup happens server-side; the PIN table is never exposed to clients.
//   - isActive must be true — deactivated devices are rejected.
//   - lastActiveAt is updated on successful pair for heartbeat tracking.
// -----------------------------------------------------------------------------
export const pairTabletSession = mutation({
  args: {
    pinCode: v.string(),
  },
  handler: async (ctx, args) => {
    // Look up the PIN in the kioskDevices table using its dedicated index
    const device = await ctx.db
      .query("kioskDevices")
      .withIndex("by_pinCode", (q) => q.eq("pinCode", args.pinCode))
      .unique();

    // No device found for this PIN
    if (!device) {
      return {
        success: false as const,
        error: "Invalid PIN. Please ask your caregiver to check the code.",
      };
    }

    // Device exists but has been deactivated by the caregiver
    if (!device.isActive) {
      return {
        success: false as const,
        error: "This device has been deactivated. Please contact your caregiver.",
      };
    }

    // Valid active device — update the heartbeat timestamp
    await ctx.db.patch(device._id, {
      lastActiveAt: Date.now(),
    });

    // Return the caregiver context so the kiosk frontend can hydrate its state
    return {
      success: true as const,
      caregiverId: device.caregiverId,
      seniorName: device.seniorName,
    };
  },
});

// -----------------------------------------------------------------------------
// generateKioskPin
// -----------------------------------------------------------------------------
// Authenticated mutation: only caregivers can generate PINs.
//
// Creates a new kioskDevice record with a random 6-digit PIN.
// Any existing active device for this caregiver is deactivated first
// to ensure only one active tablet per caregiver at a time.
// -----------------------------------------------------------------------------
export const generateKioskPin = mutation({
  args: {
    seniorName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated: Only caregivers can generate a PIN.");
    }
    const caregiverId = identity.tokenIdentifier;

    // Deactivate any existing active device for this caregiver
    const existingDevices = await ctx.db
      .query("kioskDevices")
      .withIndex("by_caregiverId", (q) => q.eq("caregiverId", caregiverId))
      .take(20);

    for (const device of existingDevices) {
      if (device.isActive) {
        await ctx.db.patch(device._id, { isActive: false });
      }
    }

    // Generate a random 6-digit numeric PIN
    const pinCode = Math.floor(100000 + Math.random() * 900000).toString();

    await ctx.db.insert("kioskDevices", {
      caregiverId,
      pinCode,
      isActive: true,
      seniorName: args.seniorName,
      lastActiveAt: undefined,
    });

    // Return the PIN to display to the caregiver
    return { pinCode };
  },
});

// -----------------------------------------------------------------------------
// deactivateKioskDevice
// -----------------------------------------------------------------------------
// Authenticated: lets the caregiver remotely deactivate a tablet.
// -----------------------------------------------------------------------------
export const deactivateKioskDevice = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated.");
    }
    const caregiverId = identity.tokenIdentifier;

    const devices = await ctx.db
      .query("kioskDevices")
      .withIndex("by_caregiverId", (q) => q.eq("caregiverId", caregiverId))
      .take(20);

    for (const device of devices) {
      if (device.isActive) {
        await ctx.db.patch(device._id, { isActive: false });
      }
    }

    return { deactivated: true };
  },
});
