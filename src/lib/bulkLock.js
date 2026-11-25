import { useSyncExternalStore } from 'react';

// Module scope on purpose: a bulk run outlives the page component that started it, so a
// remount (leaving the page and coming back) must still see the run as in progress.
let active = false;
const listeners = new Set();

const emit = () => listeners.forEach((listener) => listener());

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const isBulkLocked = () => active;

export function tryAcquireBulkLock() {
  if (active) return false;
  active = true;
  emit();
  return true;
}

export function releaseBulkLock() {
  if (!active) return;
  active = false;
  emit();
}

export const useBulkLocked = () => useSyncExternalStore(subscribe, isBulkLocked);
