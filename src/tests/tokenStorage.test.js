import { describe, it, expect, vi, beforeEach } from 'vitest';

// Utilidad para recargar un módulo con un mock distinto de constants
async function loadWithStrategy(strategy) {
  vi.doMock('../components/config/constants', () => ({
    AUTH_STORAGE: strategy,
  }));
  const mod = await import('../utils/tokenStorage');
  return mod;
}

beforeEach(() => {
  vi.resetModules();
  // Mock de localStorage y sessionStorage
  const makeStore = () => {
    const store = new Map();
    return {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
      clear: () => store.clear(),
    };
  };
  globalThis.localStorage = makeStore();
  globalThis.sessionStorage = makeStore();
});

describe('tokenStorage', () => {
  it('estrategia memory: persiste solo en memoria', async () => {
    const { setToken, getToken, removeToken } = await loadWithStrategy('memory');
    expect(getToken()).toBe(null);
    setToken('abc');
    expect(getToken()).toBe('abc');
    removeToken();
    expect(getToken()).toBe(null);
  });

  it('estrategia local: usa localStorage', async () => {
    const { setToken, getToken, removeToken } = await loadWithStrategy('local');
    setToken('tok');
  expect(getToken()).toBe('tok');
  removeToken();
  expect(getToken()).toBe(null);
  });

  it('estrategia session: usa sessionStorage', async () => {
    const { setToken, getToken, removeToken } = await loadWithStrategy('session');
    setToken('tok');
  expect(getToken()).toBe('tok');
  removeToken();
  expect(getToken()).toBe(null);
  });

  it('estrategia cookie: no expone token', async () => {
    const { setToken, getToken } = await loadWithStrategy('cookie');
    setToken('tok');
    expect(getToken()).toBe(null);
  });
});
