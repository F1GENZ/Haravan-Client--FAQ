import { describe, expect, it } from 'vitest';
import { parseSessionFragment } from '../session';

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
