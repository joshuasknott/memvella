const DISTRESS_RULES = [
  { marker: "fell", pattern: /\b(i fell|i have fallen|i'm on the floor)\b/i },
  { marker: "afraid", pattern: /\b(i'?m scared|i am scared|i feel unsafe)\b/i },
  { marker: "pain", pattern: /\b(i'm in pain|i am in pain|it hurts badly)\b/i },
  { marker: "lost", pattern: /\b(i'm lost|i am lost|i don't know where i am)\b/i },
  { marker: "stuck", pattern: /\b(i can't get up|i cannot get up|i'm stuck)\b/i },
  { marker: "help", pattern: /\bhelp me\b/i },
] as const;

const MEDICAL_RULES = [
  { marker: "pill", pattern: /\b(pill|tablet|capsule|medicine|medication)\b/i },
  { marker: "dosage", pattern: /\b(dose|dosage|how much should i take)\b/i },
  { marker: "diagnosis", pattern: /\b(do i have|diagnose|diagnosis|symptom)\b/i },
  { marker: "treatment", pattern: /\b(treatment|prescription|antibiotic|insulin)\b/i },
  { marker: "blood pressure", pattern: /\bblood pressure\b/i },
] as const;

export type VoiceSafetyScan = {
  distressDetected: boolean;
  distressMarkers: string[];
  medicalRejected: boolean;
  medicalMarkers: string[];
};

function uniqueMarkers(markers: string[]) {
  return [...new Set(markers)];
}

export function scanVoiceSafety(transcript: string): VoiceSafetyScan {
  const distressMarkers = uniqueMarkers(
    DISTRESS_RULES.filter((rule) => rule.pattern.test(transcript)).map(
      (rule) => rule.marker,
    ),
  );
  const medicalMarkers = uniqueMarkers(
    MEDICAL_RULES.filter((rule) => rule.pattern.test(transcript)).map(
      (rule) => rule.marker,
    ),
  );

  return {
    distressDetected: distressMarkers.length > 0,
    distressMarkers,
    medicalRejected: medicalMarkers.length > 0,
    medicalMarkers,
  };
}

export function buildMedicalBoundaryReply() {
  return "I can't tell you which pill or treatment to use. Please ask your Admin or a licensed clinician right away.";
}

export function buildSpeechRetryReply() {
  return "I didn't catch that clearly. Please try again.";
}

export function buildTranscriptExcerpt(transcript: string, maxLength = 220) {
  const cleaned = transcript.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength - 3).trimEnd()}...`;
}
