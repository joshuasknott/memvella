export function buildPairingRetryMessage(retryAfterMs: number) {
  const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  return `Too many pairing attempts. Wait ${retryAfterSeconds} seconds before trying another code.`;
}

export function isPairingRateLimitError(message: string) {
  return /^Too many pairing attempts\./i.test(message.trim());
}
