import { describe, expect, it } from 'vitest';
import {
  EDITOR_HEIGHT_MAX,
  EDITOR_HEIGHT_MAX_COMPACT,
  EDITOR_HEIGHT_MIN,
  editorHeightFor,
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

  it('falls back to a sane height without a measurement', () => {
    expect(editorHeightFor(undefined)).toBe(450);
    expect(editorHeightFor(0, true)).toBe(360);
  });
});
