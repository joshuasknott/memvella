import { describe, expect, it } from 'vitest';
import {
    normalizeWaitlistEmail,
    normalizeWaitlistSourcePath,
    parseWaitlistSubmission,
} from './waitlist-submission';

describe('waitlist submission validation', () => {
    it('normalizes valid email addresses', () => {
        expect(normalizeWaitlistEmail('  SARAH@example.COM  ')).toBe(
            'sarah@example.com',
        );
    });

    it('rejects invalid email addresses', () => {
        expect(normalizeWaitlistEmail('not-an-email')).toBeNull();
        expect(normalizeWaitlistEmail('')).toBeNull();
        expect(normalizeWaitlistEmail(null)).toBeNull();
    });

    it('keeps only local source paths', () => {
        expect(normalizeWaitlistSourcePath('/contact')).toBe('/contact');
        expect(normalizeWaitlistSourcePath('https://example.com')).toBe('/waitlist');
        expect(normalizeWaitlistSourcePath('//example.com/path')).toBe('/waitlist');
    });

    it('parses a valid waitlist submission', () => {
        expect(
            parseWaitlistSubmission({
                email: 'JANE@example.com',
                sourcePath: '/early-access',
            }),
        ).toEqual({
            ok: true,
            email: 'jane@example.com',
            sourcePath: '/early-access',
        });
    });

    it('returns a stable user-facing error for invalid submissions', () => {
        expect(parseWaitlistSubmission({ email: 'nope' })).toEqual({
            ok: false,
            error: 'A valid email address is required.',
        });
    });
});
