import { afterEach, describe, expect, it, vi } from 'vitest';

const mutationMock = vi.fn();

vi.mock('convex/browser', () => ({
    ConvexHttpClient: vi.fn(() => ({
        mutation: mutationMock,
    })),
}));

vi.mock('@memvella/backend', () => ({
    api: {
        waitlist: {
            joinWaitlist: 'waitlist.joinWaitlist',
        },
    },
}));

describe('marketing waitlist API route', () => {
    afterEach(() => {
        vi.clearAllMocks();
        delete process.env.CONVEX_URL;
    });

    it.each(['null', '[]', '"hello"', '{broken'])('rejects malformed request bodies: %s', async (body) => {
        const { POST } = await import('./route');
        const response = await POST(new Request('https://marketing.test/api/waitlist', { method: 'POST', body }));
        expect(response.status).toBe(400);
        expect(mutationMock).not.toHaveBeenCalled();
    });

    it('returns an honest retry response when Convex has not saved a rate-limited submission', async () => {
        process.env.CONVEX_URL = 'https://example.convex.cloud';
        mutationMock.mockResolvedValueOnce({ status: 'rate_limited', retryAfterMs: 1501 });
        const { POST } = await import('./route');
        const response = await POST(new Request('https://marketing.test/api/waitlist', {
            method: 'POST', body: JSON.stringify({ email: 'jane@example.com' }),
        }));
        expect(response.status).toBe(429);
        expect(response.headers.get('retry-after')).toBe('2');
        expect(await response.json()).toHaveProperty('error');
    });

    it('rejects malformed email without calling Convex', async () => {
        const { POST } = await import('./route');
        const response = await POST(
            new Request('https://marketing.test/api/waitlist', {
                method: 'POST',
                body: JSON.stringify({ email: 'not-an-email', sourcePath: '/contact' }),
            }),
        );

        await expect(response.json()).resolves.toEqual({
            error: 'A valid email address is required.',
        });
        expect(response.status).toBe(400);
        expect(mutationMock).not.toHaveBeenCalled();
    });

    it('accepts a valid-looking request path with a mocked Convex mutation', async () => {
        process.env.CONVEX_URL = 'https://example.convex.cloud';
        mutationMock.mockResolvedValueOnce({ status: 'joined' });

        const { POST } = await import('./route');
        const response = await POST(
            new Request('https://marketing.test/api/waitlist', {
                method: 'POST',
                headers: {
                    referer: 'https://marketing.test/',
                    'user-agent': 'vitest',
                },
                body: JSON.stringify({ email: 'JANE@example.com', sourcePath: '/contact' }),
            }),
        );

        await expect(response.json()).resolves.toEqual({ status: 'joined' });
        expect(response.status).toBe(200);
        expect(mutationMock).toHaveBeenCalledWith('waitlist.joinWaitlist', {
            email: 'jane@example.com',
            sourcePath: '/contact',
            referrer: 'https://marketing.test/',
            userAgent: 'vitest',
        });
    });
});
