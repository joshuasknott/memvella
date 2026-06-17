import type { SeniorSessionInvalidReason } from "./seniorAccessHelpers";

export const ORGANISER_LABEL = "Workspace owner";
export const CIRCLE_LABEL = "Workspace";
export const MEMBER_LABEL = "Supporter";
export const ORGANISER_DEVICE_LABEL = `${ORGANISER_LABEL} device`;
export const TABLET_PROFILE_LABEL = "Companion tablet profile";

export function buildCircleName(displayName: string) {
  return `${displayName} ${CIRCLE_LABEL}`;
}

export function normalizeUserFacingText(value: string | null | undefined) {
  const normalized = value?.trim();
  if (!normalized) {
    return null;
  }

  if (
    normalized === "Senior" ||
    normalized === "Assisted Senior"
  ) {
    return MEMBER_LABEL;
  }

  return normalized;
}

export function formatInvalidSessionMessage(reason: SeniorSessionInvalidReason) {
  switch (reason) {
    case "not_found":
      return "This session is no longer valid because it could not be found.";
    case "device_mismatch":
      return "This session is no longer valid on this device.";
    case "expired":
      return "This session has expired.";
    case "idle_timeout":
      return "This session ended after too much idle time.";
    case "revoked":
      return "This session is no longer active.";
    case "wrong_experience":
      return "This session does not match this experience.";
  }
}
