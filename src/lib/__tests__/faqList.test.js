import { describe, expect, it } from 'vitest';
import {
  BULK_ACTIONS,
  LIST_ERROR_TITLE,
  LIST_ERROR_TITLE_STALE,
  PREVIEW_MAX_LENGTH,
  describeBulkResult,
  entryCategory,
  faqCategories,
  faqPreviewText,
  filterFaqEntries,
  hasActiveFilters,
  htmlToText,
  listErrorCopy,
  normalizeSearchText,
  planBulkAction,
  schemaUpdatePayload,
} from '../faqList';
import { toFaqEntry } from '../faq';

const makeEntry = (id, value, extra = {}) =>
  toFaqEntry({
    id: String(id),
    key: `faq_${id}`,
    type: 'shop',
    objectid: '0',
    value: JSON.stringify({ schema: false, position: id, ...value }),
    ...extra,
  });

const question = (text, answer = 'Câu trả lời', categories = 'Giao hàng') =>
  makeEntry(1, { question: text, answer, categories });

describe('normalizeSearchText', () => {
  it('folds case, diacritics and the đ letter', () => {
    expect(normalizeSearchText('Câu Hỏi Đường')).toBe('cau hoi duong');
    expect(normalizeSearchText('  ĐỔI   TRẢ ')).toBe('doi tra');
  });

  it('tolerates empty and non-string input', () => {
    expect(normalizeSearchText(undefined)).toBe('');
    expect(normalizeSearchText(null)).toBe('');
    expect(normalizeSearchText(42)).toBe('42');
  });
});

describe('htmlToText', () => {
  it('keeps the text and drops tags, scripts and block boundaries', () => {
    const html =
      '<p>Giao trong <strong>2 ngày</strong>.</p><ul><li>Miễn phí</li><li>Toàn quốc</li></ul><script>alert(1)</script>';
    expect(htmlToText(html)).toBe('Giao trong 2 ngày. Miễn phí Toàn quốc');
  });

  it('decodes the entities TinyMCE writes', () => {
    expect(htmlToText('A &amp; B &lt;3 &nbsp; C')).toBe('A & B <3 C');
    expect(htmlToText('&amp;lt;')).toBe('&lt;');
  });

  it('returns an empty string for an empty answer', () => {
    expect(htmlToText('')).toBe('');
    expect(htmlToText(null)).toBe('');
  });
});

describe('faqPreviewText', () => {
  it('builds a plain-text preview and cuts long answers', () => {
    const entry = question('Hỏi', `<p>${'a'.repeat(PREVIEW_MAX_LENGTH + 10)}</p>`);
    const preview = faqPreviewText(entry);
    expect(preview.startsWith('<')).toBe(false);
    expect(preview).toHaveLength(PREVIEW_MAX_LENGTH + 1);
    expect(preview.endsWith('…')).toBe(true);
  });

  it('returns the whole text when it fits', () => {
    expect(faqPreviewText(question('Hỏi', '<p>Ngắn gọn</p>'))).toBe('Ngắn gọn');
  });

  it('reads the answer of a legacy entry without parsedValue', () => {
    expect(faqPreviewText({ value: JSON.stringify({ answer: '<b>OK</b>' }) })).toBe('OK');
  });
});

describe('faqCategories', () => {
  it('lists unique categories with the default for blanks', () => {
    const entries = [
      makeEntry(1, { question: 'a', categories: 'Giao hàng' }),
      makeEntry(2, { question: 'b', categories: '  ' }),
      makeEntry(3, { question: 'c', categories: 'Giao hàng' }),
      makeEntry(4, { question: 'd', categories: 'Đổi trả' }),
    ];
    expect(faqCategories(entries)).toEqual(['Đổi trả', 'Giao hàng', 'Không phân loại']);
    expect(entryCategory(entries[1])).toBe('Không phân loại');
  });
});

describe('filterFaqEntries', () => {
  const entries = [
    makeEntry(1, { question: 'Thời gian giao hàng?', answer: '<p>Khoảng 2 ngày</p>', categories: 'Giao hàng' }),
    makeEntry(2, { question: 'Có đổi trả không?', answer: '<p>Đổi trong 7 ngày</p>', categories: 'Đổi trả' }),
    makeEntry(3, { question: 'Thanh toán COD?', answer: '<p>Miễn phí ship</p>', categories: 'Giao hàng' }),
  ];

  it('returns every entry without filters', () => {
    expect(filterFaqEntries(entries)).toHaveLength(3);
    expect(hasActiveFilters({})).toBe(false);
  });

  it('matches the question without diacritics or case', () => {
    expect(filterFaqEntries(entries, { query: 'thoi gian' }).map((e) => e.id)).toEqual(['1']);
    expect(hasActiveFilters({ query: '  ' })).toBe(false);
  });

  it('matches the answer plain text, not the raw HTML', () => {
    expect(filterFaqEntries(entries, { query: 'mien phi' }).map((e) => e.id)).toEqual(['3']);
    expect(filterFaqEntries(entries, { query: '2 ngay' }).map((e) => e.id)).toEqual(['1']);
    expect(filterFaqEntries(entries, { query: '<p>' })).toEqual([]);
  });

  it('filters by category', () => {
    expect(filterFaqEntries(entries, { category: 'Giao hàng' }).map((e) => e.id)).toEqual(['1', '3']);
    expect(hasActiveFilters({ category: 'Giao hàng' })).toBe(true);
  });

  it('combines the query and the category', () => {
    expect(
      filterFaqEntries(entries, { query: 'doi', category: 'Đổi trả' }).map((e) => e.id)
    ).toEqual(['2']);
    expect(filterFaqEntries(entries, { query: 'doi', category: 'Giao hàng' })).toEqual([]);
  });
});

describe('planBulkAction', () => {
  const entries = [
    makeEntry(1, { question: 'a' }),
    makeEntry(2, { question: 'b' }),
    { ...makeEntry(3, { question: 'c' }), pending: true },
    makeEntry(4, { question: 'd' }),
  ];

  it('keeps the list order and skips pending rows', () => {
    const plan = planBulkAction(BULK_ACTIONS.delete, entries, ['4', '1', '3']);
    expect(plan.action).toBe(BULK_ACTIONS.delete);
    expect(plan.runnable.map((entry) => entry.id)).toEqual(['1', '4']);
    expect(plan.skipped.map((entry) => entry.id)).toEqual(['3']);
  });

  it('ignores ids that are not in the list', () => {
    const plan = planBulkAction(BULK_ACTIONS.schemaOn, entries, ['999']);
    expect(plan.runnable).toEqual([]);
    expect(plan.skipped).toEqual([]);
  });

  it('accepts numeric selections', () => {
    const plan = planBulkAction(BULK_ACTIONS.schemaOff, entries, [2]);
    expect(plan.runnable.map((entry) => entry.id)).toEqual(['2']);
  });
});

describe('schemaUpdatePayload', () => {
  it('rebuilds the stored FAQ with the new schema flag', () => {
    const entry = makeEntry(7, {
      question: 'Hỏi',
      answer: '<p>Đáp</p>',
      categories: 'Giao hàng',
      schema: false,
      position: 7,
    });
    expect(schemaUpdatePayload('shop', '0', entry, true)).toEqual({
      type: 'shop',
      objectid: '0',
      key: 'faq_7',
      metafieldid: '7',
      question: 'Hỏi',
      answer: '<p>Đáp</p>',
      categories: 'Giao hàng',
      schema: true,
      position: 7,
    });
  });
});

describe('listErrorCopy', () => {
  it('names a first-load failure and always adds an actionable description', () => {
    const copy = listErrorCopy({ hasEntries: false, status: 500 });
    expect(copy.title).toBe(LIST_ERROR_TITLE);
    expect(copy.description).toBe('Máy chủ chưa phản hồi. Bấm Thử lại sau ít phút.');
    expect(copy.title).not.toBe(copy.description);
  });

  it('uses the server message when the API sent one', () => {
    const copy = listErrorCopy({ hasEntries: false, status: 400, message: 'Type is required' });
    expect(copy.description).toBe('Type is required');
  });

  it('keeps the previous data label when a refetch fails', () => {
    const copy = listErrorCopy({ hasEntries: true, status: 0 });
    expect(copy.title).toBe(LIST_ERROR_TITLE_STALE);
    expect(copy.description).not.toBe(copy.title);
  });

  it.each([
    [false, 0, ''],
    [false, 400, 'Dữ liệu không hợp lệ.'],
    [false, 500, ''],
    [true, 0, ''],
    [true, 400, 'Dữ liệu không hợp lệ.'],
    [true, 500, ''],
  ])('never repeats the title (hasEntries=%s, status=%s)', (hasEntries, status, message) => {
    const copy = listErrorCopy({ hasEntries, status, message });
    expect(copy.title.length).toBeGreaterThan(0);
    expect(copy.description.length).toBeGreaterThan(0);
    expect(copy.title).not.toBe(copy.description);
  });
});

describe('describeBulkResult', () => {
  it('summarizes a fully successful run', () => {
    const result = describeBulkResult({ action: BULK_ACTIONS.delete, succeeded: 2 });
    expect(result.type).toBe('success');
    expect(result.summary).toBe('Đã xóa 2 câu hỏi.');
  });

  it('reports skipped, failed and stopped runs', () => {
    const result = describeBulkResult({
      action: BULK_ACTIONS.schemaOn,
      succeeded: 1,
      failures: [{ question: 'b', message: 'lỗi' }],
      skipped: 2,
      stopped: true,
    });
    expect(result.type).toBe('error');
    expect(result.summary).toContain('Đã cập nhật Schema cho 1 câu hỏi');
    expect(result.summary).toContain('bỏ qua 2 câu (đang chờ đồng bộ hoặc không còn trong danh sách)');
    expect(result.summary).toContain('1 câu lỗi');
    expect(result.summary).toContain('Đã dừng vì hết lượt dùng thử');
  });

  it('falls back when nothing ran', () => {
    expect(describeBulkResult({ action: BULK_ACTIONS.delete }).summary).toBe(
      'Không có câu hỏi nào được xử lý.'
    );
  });
});
