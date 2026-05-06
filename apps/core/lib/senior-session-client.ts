"use client";

export type SeniorExperience = "assisted" | "independent";

export type SeniorSessionState = {
  sessionToken: string;
  deviceFingerprint?: string;
  recoveryKey?: string;
  seniorProfileId?: string;
  seniorName?: string;
  hasPasskey?: boolean;
};

export function getSeniorSessionStorageKey(experience: SeniorExperience) {
  return `memvella_${experience}_senior_session`;
}

export function getSeniorRecoveryHintStorageKey(experience: SeniorExperience) {
  return `memvella_${experience}_senior_recovery_hint`;
}

export type SeniorRecoveryHint = Omit<SeniorSessionState, "sessionToken">;

export function loadSeniorSession(experience: SeniorExperience) {
  const raw = localStorage.getItem(getSeniorSessionStorageKey(experience));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SeniorSessionState;
  } catch {
    localStorage.removeItem(getSeniorSessionStorageKey(experience));
    return null;
  }
}

export function saveSeniorSession(
  experience: SeniorExperience,
  sessionState: SeniorSessionState,
) {
  localStorage.setItem(
    getSeniorSessionStorageKey(experience),
    JSON.stringify(sessionState),
  );
}

export function clearSeniorSession(experience: SeniorExperience) {
  localStorage.removeItem(getSeniorSessionStorageKey(experience));
  localStorage.removeItem(getSeniorRecoveryHintStorageKey(experience));
}

export function loadSeniorRecoveryHint(experience: SeniorExperience) {
  const raw = localStorage.getItem(getSeniorRecoveryHintStorageKey(experience));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SeniorRecoveryHint;
  } catch {
    localStorage.removeItem(getSeniorRecoveryHintStorageKey(experience));
    return null;
  }
}

export function saveSeniorRecoveryHint(
  experience: SeniorExperience,
  recoveryHint: SeniorRecoveryHint,
) {
  localStorage.setItem(
    getSeniorRecoveryHintStorageKey(experience),
    JSON.stringify(recoveryHint),
  );
}

export function clearSeniorRecoveryHint(experience: SeniorExperience) {
  localStorage.removeItem(getSeniorRecoveryHintStorageKey(experience));
}
