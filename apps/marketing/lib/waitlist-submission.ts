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
    return email.length <= 254 && EMAIL_RE.test(email) ? email : null;
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
    input: unknown,
): WaitlistSubmissionResult {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
        return { ok: false, error: 'A valid email address is required.' };
    }
    const submission = input as WaitlistSubmissionInput;
    const email = normalizeWaitlistEmail(submission.email);
    if (!email) {
        return { ok: false, error: 'A valid email address is required.' };
    }

    return {
        ok: true,
        email,
        sourcePath: normalizeWaitlistSourcePath(submission.sourcePath),
    };
}
