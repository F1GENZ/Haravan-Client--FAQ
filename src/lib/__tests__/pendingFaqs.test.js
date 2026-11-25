import { describe, expect, it } from 'vitest';
import {
  PENDING_FAQ_TTL_MS,
  addPendingFaq,
  buildCreatedFaqEntry,
  faqPendingKey,
  forgetPendingFaq,
  mergePendingFaqs,
} from '../pendingFaqs';
import { toFaqEntry } from '../faq';

const owner = { type: 'pages', objectid: '42' };

function makeEntry(id, question = `Câu hỏi ${id}`) {
  return toFaqEntry({
    id,
    value: JSON.stringify({ question, answer: 'Trả lời', categories: 'Giao hàng', schema: false, position: 1 }),
  });
}

const payload = {
  type: 'pages',
  objectid: '42',
  key: 'faq_abc_123',
  question: 'Câu hỏi mới',
  answer: '<p>Trả lời</p>',
  categories: 'Giao hàng',
  schema: true,
  position: 2,
};

describe('buildCreatedFaqEntry', () => {
  it('uses the metafield returned by the API', () => {
    const entry = buildCreatedFaqEntry(payload, {
      id: 900,
      value: JSON.stringify({ question: 'Từ server', answer: 'A', categories: 'B', schema: false, position: 2 }),
    });
    expect(entry.id).toBe(900);
    expect(entry.type).toBe('pages');
    expect(entry.objectid).toBe('42');
    expect(entry.parsedValue.question).toBe('Từ server');
  });

  it('falls back to the submitted payload when the metafield carries no value', () => {
    const entry = buildCreatedFaqEntry(payload, { id: 901 });
    expect(entry.parsedValue).toMatchObject({
      question: 'Câu hỏi mới',
      answer: '<p>Trả lời</p>',
      categories: 'Giao hàng',
      schema: true,
      position: 2,
    });
    expect(entry.position).toBe(2);
  });
});

describe('mergePendingFaqs', () => {
  it('keeps a pending item that the server list does not carry yet', () => {
    const store = new Map();
    const pending = makeEntry(500, 'Vừa tạo');
    addPendingFaq(store, owner, pending, 1000);

    const merged = mergePendingFaqs(store, owner, [makeEntry(1)], 2000);

    expect(merged.map((entry) => entry.id)).toEqual([1, 500]);
    expect(store.get(faqPendingKey('pages', '42'))).toHaveLength(1);
  });

  it('stops merging once the server list contains the id', () => {
    const store = new Map();
    addPendingFaq(store, owner, makeEntry(500), 1000);

    const merged = mergePendingFaqs(store, owner, [makeEntry(500)], 2000);

    expect(merged.map((entry) => entry.id)).toEqual([500]);
    expect(store.has(faqPendingKey('pages', '42'))).toBe(false);
  });

  it('drops the pending item after the grace window', () => {
    const store = new Map();
    addPendingFaq(store, owner, makeEntry(500), 1000);

    const merged = mergePendingFaqs(store, owner, [], 1000 + PENDING_FAQ_TTL_MS);

    expect(merged).toEqual([]);
    expect(store.has(faqPendingKey('pages', '42'))).toBe(false);
  });

  it('matches ids regardless of their string or numeric form', () => {
    const store = new Map();
    addPendingFaq(store, owner, makeEntry('500'), 1000);

    const merged = mergePendingFaqs(store, owner, [makeEntry(500)], 2000);

    expect(merged).toHaveLength(1);
    expect(store.has(faqPendingKey('pages', '42'))).toBe(false);
  });

  it('marks merged pending entries so the list can show a sync notice', () => {
    const store = new Map();
    addPendingFaq(store, owner, makeEntry(500), 1000);

    const merged = mergePendingFaqs(store, owner, [makeEntry(1)], 2000);

    expect(merged.find((entry) => entry.id === 500)?.pending).toBe(true);
    expect(merged.find((entry) => entry.id === 1)?.pending).toBeUndefined();
  });

  it('leaves the server entries untouched and ignores other owners', () => {
    const store = new Map();
    addPendingFaq(store, { type: 'products', objectid: '7' }, makeEntry(500), 1000);
    const serverEntries = [makeEntry(1), makeEntry(2)];

    const merged = mergePendingFaqs(store, owner, serverEntries, 2000);

    expect(merged).toEqual(serverEntries);
    expect(store.get(faqPendingKey('products', '7'))).toHaveLength(1);
  });
});

describe('forgetPendingFaq', () => {
  it('removes the deleted item and keeps the rest', () => {
    const store = new Map();
    addPendingFaq(store, owner, makeEntry(500), 1000);
    addPendingFaq(store, owner, makeEntry(501), 1000);

    forgetPendingFaq(store, owner, 500);

    expect(store.get(faqPendingKey('pages', '42')).map((item) => item.entry.id)).toEqual([501]);
    expect(mergePendingFaqs(store, owner, [], 2000).map((entry) => entry.id)).toEqual([501]);
  });

  it('clears the store entry when the last pending item is deleted', () => {
    const store = new Map();
    addPendingFaq(store, owner, makeEntry(500), 1000);

    forgetPendingFaq(store, owner, '500');

    expect(store.has(faqPendingKey('pages', '42'))).toBe(false);
  });

  it('is a no-op for an unknown owner or id', () => {
    const store = new Map();
    addPendingFaq(store, owner, makeEntry(500), 1000);

    forgetPendingFaq(store, owner, 999);
    forgetPendingFaq(store, { type: 'shop', objectid: '0' }, 500);

    expect(store.get(faqPendingKey('pages', '42'))).toHaveLength(1);
  });
});
