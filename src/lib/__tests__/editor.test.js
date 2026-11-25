import { describe, expect, it } from 'vitest';
import {
  EDITOR_HEIGHT_MAX,
  EDITOR_HEIGHT_MAX_COMPACT,
  EDITOR_HEIGHT_MIN,
  editorHeightFor,
  isCompactViewport,
} from '../editor';

describe('editorHeightFor', () => {
  it('takes half of a desktop viewport', () => {
    expect(editorHeightFor(933)).toBe(467);
    expect(editorHeightFor(1080)).toBe(EDITOR_HEIGHT_MAX);
  });

  it('caps a tall monitor and floors a short one', () => {
    expect(editorHeightFor(2560)).toBe(EDITOR_HEIGHT_MAX);
    expect(editorHeightFor(320)).toBe(EDITOR_HEIGHT_MIN);
  });

  it('uses the compact share and cap on a phone layout', () => {
    expect(editorHeightFor(812, true)).toBe(325);
    expect(editorHeightFor(1400, true)).toBe(EDITOR_HEIGHT_MAX_COMPACT);
    expect(editorHeightFor(812, true)).toBeLessThan(editorHeightFor(812, false));
  });

  it('never lifts a short landscape viewport above the desktop floor', () => {
    expect(editorHeightFor(375, true)).toBe(EDITOR_HEIGHT_MIN);
  });

  it('falls back to a sane height without a measurement', () => {
    expect(editorHeightFor(undefined)).toBe(450);
    expect(editorHeightFor(0, true)).toBe(360);
  });
});

describe('isCompactViewport', () => {
  it('treats anything at or below the phone width as compact', () => {
    expect(isCompactViewport(375, 812)).toBe(true);
    expect(isCompactViewport(767, 1024)).toBe(true);
    expect(isCompactViewport(768, 1024)).toBe(false);
    expect(isCompactViewport(1920, 1080)).toBe(false);
  });

  it('treats a short viewport as compact even when it is wide', () => {
    expect(isCompactViewport(812, 375)).toBe(true);
    expect(isCompactViewport(1440, 599)).toBe(true);
    expect(isCompactViewport(1440, 600)).toBe(false);
  });

  it('is not compact without a measurement', () => {
    expect(isCompactViewport(undefined, undefined)).toBe(false);
  });
});
