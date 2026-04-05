const E164_PHONE_NUMBER_PATTERN = /^\+[1-9]\d{6,14}$/;

function stripToDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidE164PhoneNumber(value: string) {
  return E164_PHONE_NUMBER_PATTERN.test(value);
}

export function normalizePhoneNumber(args: {
  countryCode?: string | null;
  phoneNumber: string;
}) {
  const rawPhoneNumber = args.phoneNumber.trim();
  if (!rawPhoneNumber) {
    return null;
  }

  if (rawPhoneNumber.startsWith("+")) {
    const directNumber = `+${stripToDigits(rawPhoneNumber)}`;
    return isValidE164PhoneNumber(directNumber) ? directNumber : null;
  }

  const countryDigits = stripToDigits(args.countryCode ?? "");
  let localDigits = stripToDigits(rawPhoneNumber);
  if (!countryDigits || !localDigits) {
    return null;
  }

  if (localDigits.startsWith("0")) {
    localDigits = localDigits.slice(1);
  }

  const normalizedPhoneNumber = `+${countryDigits}${localDigits}`;
  return isValidE164PhoneNumber(normalizedPhoneNumber)
    ? normalizedPhoneNumber
    : null;
}
