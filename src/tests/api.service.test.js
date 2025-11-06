import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();

globalThis.fetch = mockFetch;

beforeEach(() => {
  vi.resetModules();
  mockFetch.mockReset();
});

async function loadApiWith(config = {}) {
  vi.doMock('../components/config/constants', () => ({
    API_BASE_URL: config.API_BASE_URL ?? 'http://api.test/api',
    AUTH_STRATEGY: config.AUTH_STRATEGY ?? 'token',
  }));
  vi.doMock('../utils/tokenStorage', () => ({
    getToken: () => config.token ?? 'jwt123',
  }));
  const mod = await import('../services/api.service');
  return mod.default;
}

describe('api.service', () => {
  it('envía Authorization Bearer en estrategia token', async () => {
    const api = await loadApiWith({});
    mockFetch.mockResolvedValueOnce({ ok: true, headers: { get: () => 'application/json' }, json: async () => ({ ok: true }) });
    await api.request('/ping');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe('http://api.test/api/ping');
    expect(opts.headers.Authorization).toMatch(/^Bearer /);
    expect(opts.credentials).toBeUndefined();
  });

  it('usa credentials include y no manda Authorization en cookie', async () => {
    const api = await loadApiWith({ AUTH_STRATEGY: 'cookie' });
    mockFetch.mockResolvedValueOnce({ ok: true, headers: { get: () => 'application/json' }, json: async () => ({ ok: true }) });
    await api.request('/ping');
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers.Authorization).toBeUndefined();
    expect(opts.credentials).toBe('include');
  });

  it('si no es JSON, devuelve texto', async () => {
    const api = await loadApiWith({});
    mockFetch.mockResolvedValueOnce({ ok: true, headers: { get: () => 'text/plain' }, text: async () => 'pong' });
    const res = await api.request('/pong');
    expect(res).toBe('pong');
  });
});
