import type { SeniorSessionInvalidReason } from "./seniorAccessHelpers";

export const ORGANISER_LABEL = "Organiser";
export const CIRCLE_LABEL = "Circle";
export const MEMBER_LABEL = "Member";
export const ORGANISER_DEVICE_LABEL = `${ORGANISER_LABEL} device`;
export const TABLET_PROFILE_LABEL = "Tablet profile";
export const INDEPENDENT_PROFILE_LABEL = "Independent profile";

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
    normalized === "Assisted Senior" ||
    normalized === "Independent Senior"
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
