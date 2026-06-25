const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type WaitlistSubmissionInput = {
    email?: unknown;
    sourcePath?: unknown;
};

export type WaitlistSubmissionResult =
    | {
          ok: true;
          email: string;
          sourcePath: string;
      }
    | {
          ok: false;
          error: string;
      };

export function normalizeWaitlistEmail(value: unknown) {
    if (typeof value !== 'string') {
        return null;
    }

    const email = value.trim().toLowerCase();
    return EMAIL_RE.test(email) ? email : null;
}

export function normalizeWaitlistSourcePath(value: unknown) {
    if (typeof value !== 'string') {
        return '/waitlist';
    }

    const sourcePath = value.trim();
    if (!sourcePath || !sourcePath.startsWith('/') || sourcePath.startsWith('//')) {
        return '/waitlist';
    }

    return sourcePath.slice(0, 120);
}

export function parseWaitlistSubmission(
    input: WaitlistSubmissionInput,
): WaitlistSubmissionResult {
    const email = normalizeWaitlistEmail(input.email);
    if (!email) {
        return { ok: false, error: 'A valid email address is required.' };
    }

    return {
        ok: true,
        email,
        sourcePath: normalizeWaitlistSourcePath(input.sourcePath),
    };
}
