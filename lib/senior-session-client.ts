"use client";

export type SeniorExperience = "assisted" | "independent";

export type SeniorSessionState = {
  sessionToken: string;
  seniorProfileId?: string;
  seniorName?: string;
  recoveryEmail?: string | null;
  hasPasskey?: boolean;
};

function getStorageKey(experience: SeniorExperience) {
  return `memvella_${experience}_senior_session`;
}

function getRecoveryHintKey(experience: SeniorExperience) {
  return `memvella_${experience}_senior_recovery_hint`;
}

export type SeniorRecoveryHint = Omit<SeniorSessionState, "sessionToken">;

export function loadSeniorSession(experience: SeniorExperience) {
  const raw = localStorage.getItem(getStorageKey(experience));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SeniorSessionState;
  } catch {
    localStorage.removeItem(getStorageKey(experience));
    return null;
  }
}

export function saveSeniorSession(
  experience: SeniorExperience,
  sessionState: SeniorSessionState,
) {
  localStorage.setItem(getStorageKey(experience), JSON.stringify(sessionState));
}

export function clearSeniorSession(experience: SeniorExperience) {
  localStorage.removeItem(getStorageKey(experience));
}

export function loadSeniorRecoveryHint(experience: SeniorExperience) {
  const raw = localStorage.getItem(getRecoveryHintKey(experience));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SeniorRecoveryHint;
  } catch {
    localStorage.removeItem(getRecoveryHintKey(experience));
    return null;
  }
}

export function saveSeniorRecoveryHint(
  experience: SeniorExperience,
  recoveryHint: SeniorRecoveryHint,
) {
  localStorage.setItem(
    getRecoveryHintKey(experience),
    JSON.stringify(recoveryHint),
  );
}
