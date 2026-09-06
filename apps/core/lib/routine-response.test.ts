import { expect, it } from "vitest";
import { routineResponseOutcome } from "./routine-response";

it.each(["Yes", "Yes, I have.", "Done!", "I've done that", "All done, thank you"])("recognizes a clear confirmation: %s", (text) => {
  expect(routineResponseOutcome(text)).toBe("confirmed");
});

it.each(["No", "Not yet", "Yes, but I haven't done it", "I don't know", "I think so", "I would like some tea", ""])("does not treat an ambiguous or negative response as confirmation: %s", (text) => {
  expect(routineResponseOutcome(text)).toBe("unconfirmed");
});
