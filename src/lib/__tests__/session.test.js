import { afterEach, describe, expect, it } from 'vitest';
import {
  ORGID_KEY,
  SESSION_KEY,
  clearSessionToken,
  getOrgid,
  parseSessionFragment,
  storeSession,
} from '../session';

describe('parseSessionFragment', () => {
  it('reads the session and orgid from the hash fragment', () => {
    expect(parseSessionFragment('#session=abc.def&orgid=123456')).toEqual({
      session: 'abc.def',
      orgid: '123456',
    });
  });

  it('accepts a fragment without the leading #', () => {
    expect(parseSessionFragment('session=abc.def&orgid=1')).toEqual({
      session: 'abc.def',
      orgid: '1',
    });
  });

  it('ignores unrelated parameters and decodes values', () => {
    expect(parseSessionFragment('#foo=bar&session=a%2Eb%2Ec&orgid=9&x=1')).toEqual({
      session: 'a.b.c',
      orgid: '9',
    });
  });

  it('returns null when the session is missing or blank', () => {
    expect(parseSessionFragment('')).toBeNull();
    expect(parseSessionFragment('#')).toBeNull();
    expect(parseSessionFragment('#orgid=123')).toBeNull();
    expect(parseSessionFragment('#session=&orgid=123')).toBeNull();
    expect(parseSessionFragment('#session=null&orgid=123')).toBeNull();
    expect(parseSessionFragment('#session=undefined&orgid=123')).toBeNull();
  });

  it('keeps the session when the orgid is absent or blank', () => {
    expect(parseSessionFragment('#session=abc.def')).toEqual({
      session: 'abc.def',
      orgid: null,
    });
    expect(parseSessionFragment('#session=abc.def&orgid=')).toEqual({
      session: 'abc.def',
      orgid: null,
    });
  });

  it('returns null for a non-string input', () => {
    expect(parseSessionFragment(null)).toBeNull();
    expect(parseSessionFragment(undefined)).toBeNull();
  });
});

function installStorage() {
  const data = new Map();
  const make = () => ({
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  });
  globalThis.window = {
    localStorage: make(),
    sessionStorage: make(),
  };
  return data;
}

function installOnlySessionStorage() {
  const data = new Map();
  globalThis.window = {
    localStorage: null,
    sessionStorage: {
      getItem: (key) => (data.has(key) ? data.get(key) : null),
      setItem: (key, value) => data.set(key, String(value)),
      removeItem: (key) => data.delete(key),
    },
  };
  return data;
}

afterEach(() => {
  delete globalThis.window;
});

describe('session storage', () => {
  it('stores both the token and the org id', () => {
    const data = installStorage();
    storeSession({ session: 'abc.def', orgid: '123' });
    expect(data.get(SESSION_KEY)).toBe('abc.def');
    expect(data.get(ORGID_KEY)).toBe('123');
    expect(getOrgid()).toBe('123');
  });

  it('clears only the token so the login redirect still targets the shop', () => {
    const data = installStorage();
    storeSession({ session: 'abc.def', orgid: '123' });
    clearSessionToken();
    expect(data.has(SESSION_KEY)).toBe(false);
    expect(data.get(ORGID_KEY)).toBe('123');
    expect(getOrgid()).toBe('123');
  });

  it('persists across tabs through localStorage, falling back to sessionStorage', () => {
    installStorage();
    storeSession({ session: 'abc.def', orgid: '123' });
    expect(globalThis.window.localStorage.getItem(SESSION_KEY)).toBe('abc.def');

    const legacy = installOnlySessionStorage();
    storeSession({ session: 'xyz', orgid: '9' });
    expect(legacy.get(SESSION_KEY)).toBe('xyz');
  });
});
