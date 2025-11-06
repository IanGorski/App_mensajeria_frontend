// - local: persiste en localStorage
// - session: persiste en sessionStorage
// - memory: solo en memoria (se pierde si recargo)
// - cookie: no guarda en JS; se espera HttpOnly cookie desde backend

import { AUTH_STORAGE } from '../components/config/constants';

const KEY = 'token';
let memoryToken = null;

const storageApi = {
  local: {
    get: () => (typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null),
    set: (v) => typeof localStorage !== 'undefined' && localStorage.setItem(KEY, v),
    remove: () => typeof localStorage !== 'undefined' && localStorage.removeItem(KEY),
  },
  session: {
    get: () => (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(KEY) : null),
    set: (v) => typeof sessionStorage !== 'undefined' && sessionStorage.setItem(KEY, v),
    remove: () => typeof sessionStorage !== 'undefined' && sessionStorage.removeItem(KEY),
  },
  memory: {
    get: () => memoryToken,
    set: (v) => {
      memoryToken = v;
    },
    remove: () => {
      memoryToken = null;
    },
  },
  cookie: {
    // En modo cookie, no se debe exponer token al cliente
    get: () => null,
    set: () => {},
    remove: () => {},
  },
};

const api = storageApi[AUTH_STORAGE] || storageApi.local;

export const getToken = () => api.get();
export const setToken = (token) => api.set(token);
export const removeToken = () => api.remove();

export default { getToken, setToken, removeToken };
