import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CATEGORY,
  buildDuplicatePayload,
  buildFaqPayload,
  createFaqKey,
  faqFormValues,
  groupFaqs,
  isCompliantFaqKey,
  isFaqFormDirty,
  maxFaqPosition,
  nextFaqPosition,
  normalizePosition,
  parseFaqValue,
  sortFaqEntries,
  toFaqEntries,
  toFaqEntry,
} from '../faq';

function makeEntry(id, position, categories = 'Giao hàng', question = `Câu hỏi ${id}`) {
  return toFaqEntry({
    id,
    value: JSON.stringify({ question, answer: 'Trả lời', categories, schema: false, position }),
  });
}

describe('parseFaqValue', () => {
  it('parses JSON strings and tolerates legacy or broken values', () => {
    expect(parseFaqValue('{"question":"a"}')).toEqual({ question: 'a' });
    expect(parseFaqValue('')).toEqual({});
    expect(parseFaqValue('not-json')).toEqual({});
    expect(parseFaqValue({ question: 'a' })).toEqual({ question: 'a' });
  });
});

describe('normalizePosition', () => {
  it('accepts positive integers only', () => {
    expect(normalizePosition(3)).toBe(3);
    expect(normalizePosition('4')).toBe(4);
    expect(normalizePosition(0)).toBeNull();
    expect(normalizePosition(-1)).toBeNull();
    expect(normalizePosition(1.5)).toBeNull();
    expect(normalizePosition('abc')).toBeNull();
    expect(normalizePosition(undefined)).toBeNull();
  });
});

describe('sortFaqEntries', () => {
  it('orders by position ascending with missing positions last', () => {
    const entries = [
      makeEntry(1, 3),
      makeEntry(2, 1),
      makeEntry(3, undefined),
      makeEntry(4, 2),
    ];
    expect(sortFaqEntries(entries).map((entry) => entry.id)).toEqual([2, 4, 1, 3]);
  });

  it('breaks position ties by id ascending', () => {
    const entries = [makeEntry(10, 1), makeEntry(2, 1)];
    expect(sortFaqEntries(entries).map((entry) => entry.id)).toEqual([2, 10]);
  });

  it('does not mutate the input', () => {
    const entries = [makeEntry(1, 2), makeEntry(2, 1)];
    sortFaqEntries(entries);
    expect(entries.map((entry) => entry.id)).toEqual([1, 2]);
  });
});

describe('groupFaqs', () => {
  it('groups by trimmed category, keeps position order and sorts categories', () => {
    const entries = sortFaqEntries([
      makeEntry(1, 3, 'B'),
      makeEntry(2, 1, 'A '),
      makeEntry(3, 2, 'A'),
      makeEntry(4, 4, ''),
    ]);

    const groups = groupFaqs(entries);
    expect(groups.map((group) => group.category)).toEqual([
      'A',
      'B',
      DEFAULT_CATEGORY,
    ]);
    expect(groups[0].items.map((entry) => entry.id)).toEqual([2, 3]);
    expect(groups[2].items.map((entry) => entry.id)).toEqual([4]);
  });
});

describe('positions', () => {
  it('computes max and next position', () => {
    const entries = [makeEntry(1, 2), makeEntry(2, 7), makeEntry(3, undefined)];
    expect(maxFaqPosition(entries)).toBe(7);
    expect(nextFaqPosition(entries)).toBe(8);
    expect(nextFaqPosition([])).toBe(1);
  });
});

describe('createFaqKey', () => {
  it('builds a short key with the allowed alphabet', () => {
    const key = createFaqKey(1700000000000, () => 0);
    expect(key).toMatch(/^[a-z0-9_]{1,30}$/);
    expect(key.startsWith('faq_')).toBe(true);
    expect(key).toBe(`faq_${(1700000000000).toString(36)}_000000`);
  });

  it('changes with the clock and the random source', () => {
    const first = createFaqKey(1700000000000, () => 0.1);
    const second = createFaqKey(1700000000001, () => 0.1);
    const third = createFaqKey(1700000000000, () => 0.9);
    expect(new Set([first, second, third]).size).toBe(3);
    [first, second, third].forEach((key) => {
      expect(key.length).toBeLessThanOrEqual(30);
    });
  });
});

describe('isCompliantFaqKey', () => {
  it('accepts the new format and rejects legacy keys', () => {
    expect(isCompliantFaqKey('faq_abc_123')).toBe(true);
    expect(isCompliantFaqKey('store.faqs.data.1')).toBe(false);
    expect(isCompliantFaqKey('faq_UPPER')).toBe(false);
    expect(isCompliantFaqKey(`faq_${'a'.repeat(30)}`)).toBe(false);
  });
});

describe('buildFaqPayload', () => {
  it('normalizes fields and omits metafieldid for a create', () => {
    const payload = buildFaqPayload({
      type: 'products',
      objectid: 42,
      key: 'faq_abc',
      question: '  Câu hỏi  ',
      answer: '<p>Trả lời</p>',
      categories: '  Giao hàng  ',
      schema: 1,
      position: 5,
    });

    expect(payload).toEqual({
      type: 'products',
      objectid: '42',
      key: 'faq_abc',
      question: 'Câu hỏi',
      answer: '<p>Trả lời</p>',
      categories: 'Giao hàng',
      schema: true,
      position: 5,
    });
    expect('metafieldid' in payload).toBe(false);
  });

  it('keeps metafieldid on update and omits an absent position', () => {
    const payload = buildFaqPayload({
      type: 'shop',
      objectid: '0',
      metafieldid: 99,
      key: 'faq_abc',
      question: 'Hỏi',
      answer: '',
      categories: '',
      schema: false,
      position: 0,
    });

    expect(payload.metafieldid).toBe(99);
    expect('position' in payload).toBe(false);
    expect(payload.schema).toBe(false);
  });

  it('keeps the supplied position on update', () => {
    const payload = buildFaqPayload({
      type: 'products',
      objectid: '42',
      metafieldid: 7,
      key: 'faq_abc',
      question: 'Hỏi',
      answer: '',
      categories: '',
      schema: true,
      position: 3,
    });

    expect(payload.position).toBe(3);
  });
});

describe('buildDuplicatePayload', () => {
  it('copies the answer, category and schema with a new position and key', () => {
    const entry = toFaqEntry({
      id: 7,
      key: 'faq_legacy',
      value: JSON.stringify({
        question: 'Giao hàng mất bao lâu?',
        answer: '<p>2-3 ngày</p>',
        categories: 'Giao hàng',
        schema: true,
        position: 2,
      }),
    });

    const payload = buildDuplicatePayload(
      { ...entry, type: 'collections', objectid: 12 },
      9,
      'faq_copy'
    );

    expect(payload).toEqual({
      type: 'collections',
      objectid: '12',
      key: 'faq_copy',
      question: 'Giao hàng mất bao lâu? (bản sao)',
      answer: '<p>2-3 ngày</p>',
      categories: 'Giao hàng',
      schema: true,
      position: 9,
    });
  });
});

describe('toFaqEntries', () => {
  it('ignores non-array input and skips empty rows', () => {
    expect(toFaqEntries(undefined)).toEqual([]);
    expect(toFaqEntries([null, { id: 1, value: '{}' }])).toHaveLength(1);
  });

  it('normalizes legacy schema values to booleans', () => {
    expect(
      toFaqEntry({ id: 1, value: JSON.stringify({ schema: 'true' }) }).parsedValue.schema
    ).toBe(true);
    expect(
      toFaqEntry({ id: 2, value: JSON.stringify({ schema: 'false' }) }).parsedValue.schema
    ).toBe(false);
    expect(
      toFaqEntry({ id: 3, value: JSON.stringify({ schema: 1 }) }).parsedValue.schema
    ).toBe(false);
  });
});

describe('faqFormValues', () => {
  it('defaults a new question to Schema on', () => {
    expect(faqFormValues(null)).toEqual({
      schema: true,
      categories: '',
      question: '',
      answer: '',
    });
  });

  it('loads the stored fields of an existing question', () => {
    const entry = toFaqEntry({
      id: 1,
      value: JSON.stringify({
        question: 'Hỏi',
        answer: '<p>Đáp</p>',
        categories: 'Giao hàng',
        schema: false,
      }),
    });
    expect(faqFormValues(entry)).toEqual({
      schema: false,
      categories: 'Giao hàng',
      question: 'Hỏi',
      answer: '<p>Đáp</p>',
    });
  });
});

describe('isFaqFormDirty', () => {
  const initial = faqFormValues(null);

  it('is false while every value matches the snapshot', () => {
    expect(isFaqFormDirty(initial, { ...initial })).toBe(false);
  });

  it('detects each edited field', () => {
    expect(isFaqFormDirty(initial, { ...initial, question: 'Hỏi' })).toBe(true);
    expect(isFaqFormDirty(initial, { ...initial, categories: 'Giao hàng' })).toBe(true);
    expect(isFaqFormDirty(initial, { ...initial, answer: '<p>x</p>' })).toBe(true);
    expect(isFaqFormDirty(initial, { ...initial, schema: false })).toBe(true);
  });

  it('treats a missing value as empty instead of dirty', () => {
    expect(isFaqFormDirty(initial, {})).toBe(false);
  });
});

