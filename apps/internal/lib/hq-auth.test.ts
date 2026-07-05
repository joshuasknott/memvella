import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const cookieJar = new Map<string, string>();
const cookieSetMock = vi.fn((name: string, value: string) => {
  cookieJar.set(name, value);
});
const cookieDeleteMock = vi.fn((name: string) => {
  cookieJar.delete(name);
});

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      const value = cookieJar.get(name);
      return value ? { value } : undefined;
    },
    set: cookieSetMock,
    delete: cookieDeleteMock,
  })),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

const SECRET = '12345678901234567890123456789012';

describe('Memvella HQ access', () => {
  beforeEach(() => {
    vi.resetModules();
    cookieJar.clear();
    cookieSetMock.mockClear();
    cookieDeleteMock.mockClear();
    delete process.env.MEMVELLA_HQ_ENABLED;
    delete process.env.MEMVELLA_HQ_ACCESS_KEY;
    delete process.env.MEMVELLA_HQ_COOKIE_SECRET;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reports the disabled state without requiring secrets', async () => {
    const { getHqAccessState } = await import('./hq-auth');

    expect(getHqAccessState()).toMatchObject({
      enabled: false,
      configured: false,
      missing: [],
      readOnly: true,
    });
  });

  it('reports enabled but missing configuration state', async () => {
    vi.stubEnv('MEMVELLA_HQ_ENABLED', '1');
    const { getHqAccessState } = await import('./hq-auth');

    expect(getHqAccessState()).toMatchObject({
      enabled: true,
      configured: false,
      missing: ['MEMVELLA_HQ_ACCESS_KEY', 'MEMVELLA_HQ_COOKIE_SECRET'],
    });
  });

  it('rejects an incorrect login key without setting a session cookie', async () => {
    vi.stubEnv('MEMVELLA_HQ_ENABLED', '1');
    vi.stubEnv('MEMVELLA_HQ_ACCESS_KEY', 'correct-key');
    vi.stubEnv('MEMVELLA_HQ_COOKIE_SECRET', SECRET);
    const { createFounderSession } = await import('./hq-auth');

    await expect(createFounderSession('wrong-key')).resolves.toEqual({
      ok: false,
      error: 'Access key rejected.',
    });
    expect(cookieSetMock).not.toHaveBeenCalled();
  });

  it('creates and reads a founder session when configured with test secrets', async () => {
    vi.stubEnv('MEMVELLA_HQ_ENABLED', '1');
    vi.stubEnv('MEMVELLA_HQ_ACCESS_KEY', 'correct-key');
    vi.stubEnv('MEMVELLA_HQ_COOKIE_SECRET', SECRET);
    const { createFounderSession, getHqSession } = await import('./hq-auth');

    await expect(createFounderSession('correct-key')).resolves.toEqual({ ok: true });
    expect(cookieSetMock).toHaveBeenCalledWith(
      'memvella_hq_session',
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
      }),
    );
    await expect(getHqSession()).resolves.toMatchObject({ role: 'founder' });
  });
});
