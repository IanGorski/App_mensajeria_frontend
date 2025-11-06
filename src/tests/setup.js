/*Configuración global para tests*/
import '@testing-library/jest-dom';

// Tengo que agregar acá cualquier configuración global necesaria

// Mock de localStorage con almacenamiento en memoria
(() => {
  const lsStore = new Map();
  globalThis.localStorage = {
    getItem: (key) => (lsStore.has(key) ? lsStore.get(key) : null),
    setItem: (key, value) => { lsStore.set(key, String(value)); },
    removeItem: (key) => { lsStore.delete(key); },
    clear: () => { lsStore.clear(); },
  };
})();

// Mock de sessionStorage con almacenamiento en memoria
(() => {
  const ssStore = new Map();
  globalThis.sessionStorage = {
    getItem: (key) => (ssStore.has(key) ? ssStore.get(key) : null),
    setItem: (key, value) => { ssStore.set(key, String(value)); },
    removeItem: (key) => { ssStore.delete(key); },
    clear: () => { ssStore.clear(); },
  };
})();

// Mock de window.matchMedia para tests de responsive
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, 
    removeListener: () => {}, 
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
