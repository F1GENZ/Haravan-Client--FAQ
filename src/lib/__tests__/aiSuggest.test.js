import { describe, expect, it } from 'vitest';
import { DEFAULT_CATEGORY } from '../faq';
import {
  escapeHtml,
  normalizeSuggestionCategory,
  plainTextToHtml,
  selectedSuggestionDrafts,
  suggestionToPayload,
  toSuggestionDrafts,
  validateAnswer,
  validateQuestion,
  validateSuggestionDraft,
} from '../aiSuggest';

describe('escapeHtml', () => {
  it('escapes the characters that would break stored HTML', () => {
    expect(escapeHtml('<b>"A" & \'B\'</b>')).toBe(
      '&lt;b&gt;&quot;A&quot; &amp; &#39;B&#39;&lt;/b&gt;'
    );
  });

  it('treats nullish values as empty', () => {
    expect(escapeHtml(undefined)).toBe('');
    expect(escapeHtml(null)).toBe('');
  });
});

describe('plainTextToHtml', () => {
  it('wraps every non-empty line in an escaped paragraph', () => {
    expect(plainTextToHtml('Giao trong 2 ngày.\n\nĐổi trả 30 ngày <miễn phí>.')).toBe(
      '<p>Giao trong 2 ngày.</p><p>Đổi trả 30 ngày &lt;miễn phí&gt;.</p>'
    );
  });

  it('trims each paragraph and keeps inner text intact', () => {
    expect(plainTextToHtml('  Câu một  \n Câu  hai ')).toBe(
      '<p>Câu một</p><p>Câu  hai</p>'
    );
  });

  it('returns an empty string when nothing is left', () => {
    expect(plainTextToHtml('')).toBe('');
    expect(plainTextToHtml(' \n\t\n ')).toBe('');
    expect(plainTextToHtml(null)).toBe('');
  });
});

describe('normalizeSuggestionCategory', () => {
  it('trims the suggestion category and falls back to the default category', () => {
    expect(normalizeSuggestionCategory('  Giao hàng ')).toBe('Giao hàng');
    expect(normalizeSuggestionCategory('')).toBe(DEFAULT_CATEGORY);
    expect(normalizeSuggestionCategory(undefined)).toBe(DEFAULT_CATEGORY);
  });
});

describe('toSuggestionDrafts', () => {
  it('normalizes suggestions and selects every row', () => {
    const drafts = toSuggestionDrafts([
      { question: '  Giao hàng mất bao lâu? ', answer: ' 2 ngày. ', category: ' Giao hàng ' },
      { question: 'Có đổi trả không?' },
    ]);
    expect(drafts).toEqual([
      {
        id: 'suggestion-0',
        question: 'Giao hàng mất bao lâu?',
        answer: '2 ngày.',
        category: 'Giao hàng',
        selected: true,
      },
      {
        id: 'suggestion-1',
        question: 'Có đổi trả không?',
        answer: '',
        category: '',
        selected: true,
      },
    ]);
  });

  it('ignores non-arrays and empty entries', () => {
    expect(toSuggestionDrafts(null)).toEqual([]);
    expect(toSuggestionDrafts([null, 'x', 0])).toEqual([]);
  });
});

describe('selectedSuggestionDrafts', () => {
  it('keeps only checked rows', () => {
    const drafts = [
      { id: 'a', selected: true },
      { id: 'b', selected: false },
      { id: 'c' },
    ];
    expect(selectedSuggestionDrafts(drafts).map((draft) => draft.id)).toEqual(['a']);
    expect(selectedSuggestionDrafts(null)).toEqual([]);
  });
});

describe('validateQuestion', () => {
  it('requires 5 to 100 trimmed characters', () => {
    expect(validateQuestion('    ')).toBe('Câu hỏi phải có ít nhất 5 ký tự.');
    expect(validateQuestion('abcd')).toBe('Câu hỏi phải có ít nhất 5 ký tự.');
    expect(validateQuestion('  abcde  ')).toBe('');
    expect(validateQuestion('a'.repeat(100))).toBe('');
    expect(validateQuestion('a'.repeat(101))).toBe(
      'Câu hỏi không được vượt quá 100 ký tự.'
    );
  });
});

describe('validateAnswer', () => {
  it('rejects a blank answer', () => {
    expect(validateAnswer('')).toBe('Câu trả lời không được để trống.');
    expect(validateAnswer('  \n ')).toBe('Câu trả lời không được để trống.');
    expect(validateAnswer('Có.')).toBe('');
  });
});

describe('validateSuggestionDraft', () => {
  it('returns the first field error of the draft', () => {
    expect(validateSuggestionDraft({ question: 'Ngắn', answer: 'Có.' })).toBe(
      'Câu hỏi phải có ít nhất 5 ký tự.'
    );
    expect(
      validateSuggestionDraft({ question: 'Giao hàng mất bao lâu?', answer: ' ' })
    ).toBe('Câu trả lời không được để trống.');
    expect(
      validateSuggestionDraft({ question: 'Giao hàng mất bao lâu?', answer: '2 ngày.' })
    ).toBe('');
    expect(validateSuggestionDraft(null)).toBe(
      'Câu hỏi phải có ít nhất 5 ký tự.'
    );
  });
});

describe('suggestionToPayload', () => {
  it('builds a schema-marked create payload with an HTML answer', () => {
    const payload = suggestionToPayload({
      type: 'products',
      objectid: 1001,
      key: 'faq_test_key',
      position: 7,
      draft: {
        question: '  Giao hàng mất bao lâu? ',
        answer: ' Giao trong 2 ngày.\nĐổi trả 30 ngày. ',
        category: ' Giao hàng ',
      },
    });
    expect(payload).toEqual({
      type: 'products',
      objectid: '1001',
      key: 'faq_test_key',
      question: 'Giao hàng mất bao lâu?',
      answer: '<p>Giao trong 2 ngày.</p><p>Đổi trả 30 ngày.</p>',
      categories: 'Giao hàng',
      schema: true,
      position: 7,
    });
  });

  it('escapes the answer and fills the default category', () => {
    const payload = suggestionToPayload({
      type: 'shop',
      objectid: '0',
      draft: { question: 'Có khuyến mãi?', answer: 'Không <b>có</b>.', category: '  ' },
      position: 1,
    });
    expect(payload.answer).toBe('<p>Không &lt;b&gt;có&lt;/b&gt;.</p>');
    expect(payload.categories).toBe(DEFAULT_CATEGORY);
    expect(payload.schema).toBe(true);
    expect(payload.position).toBe(1);
    expect(payload.key).toMatch(/^[a-z0-9_]{1,30}$/);
  });
});
