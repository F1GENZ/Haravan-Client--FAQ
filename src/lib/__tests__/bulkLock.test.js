import { describe, expect, it } from 'vitest';
import { isBulkLocked, releaseBulkLock, tryAcquireBulkLock } from '../bulkLock';

describe('bulk lock', () => {
  it('refuses a second run until the first one releases, whatever component asks', () => {
    expect(tryAcquireBulkLock()).toBe(true);
    expect(isBulkLocked()).toBe(true);
    expect(tryAcquireBulkLock()).toBe(false);
    releaseBulkLock();
    expect(isBulkLocked()).toBe(false);
    expect(tryAcquireBulkLock()).toBe(true);
    releaseBulkLock();
  });
});
