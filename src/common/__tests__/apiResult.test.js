import { describe, expect, it } from 'vitest';
import { toResult } from '../apiResult';

describe('toResult', () => {
  it('unwraps the success envelope', () => {
    const result = toResult({
      status: 200,
      data: { success: true, data: [{ id: 1 }], status: 200, errorCode: null, errorMessage: null },
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual([{ id: 1 }]);
  });

  it('passes a raw string body through for the login URL', () => {
    const result = toResult({
      status: 200,
      data: 'https://accounts.haravan.com/identity/connect/authorize',
    });

    expect(result.success).toBe(true);
    expect(result.data).toBe('https://accounts.haravan.com/identity/connect/authorize');
  });

  it('keeps null data when the body is empty', () => {
    expect(toResult({ status: 204, data: '' }).data).toBe('');
    expect(toResult({ status: 200, data: null }).data).toBeNull();
  });
});
