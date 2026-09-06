/** A transcript is not itself confirmation. Ambiguous responses need review. */
export function routineResponseOutcome(transcript: string): "confirmed" | "unconfirmed" {
  const words = transcript.toLowerCase().replace(/[’']/g, "").replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
  const affirmative = /^(yes|yeah|yep|done|all done|i have|i did|ive done that|i have done that|yes i have|yes i did|yes its done)( please| thank you| thanks)?$/;
  return affirmative.test(words) ? "confirmed" : "unconfirmed";
}
