import { describe, expect, it } from 'vitest';
import {
  DEFAULT_BASE_TEMPLATE_KEYS,
  MAX_TEMPLATE_TITLE_LENGTH,
  defaultSelectedKeys,
  describeInsertResults,
  describeRemoveResults,
  groupTemplates,
  isSelectableTemplate,
  resourceLabel,
  sortTemplates,
  templateStatusMeta,
  validateTemplateTitle,
} from '../templateInsert';

const template = (key, resource, status, extra = {}) => {
  const name = key.replace('templates/', '');
  return { key, name, resource, status, backup_at: null, ...extra };
};

describe('validateTemplateTitle', () => {
  it('accepts an empty title', () => {
    expect(validateTemplateTitle('')).toEqual({ ok: true, value: '', error: null });
    expect(validateTemplateTitle(undefined)).toEqual({ ok: true, value: '', error: null });
  });

  it('trims a valid title', () => {
    expect(validateTemplateTitle('  Câu hỏi thường gặp  ')).toEqual({
      ok: true,
      value: 'Câu hỏi thường gặp',
      error: null,
    });
  });

  it('rejects titles longer than the limit', () => {
    const result = validateTemplateTitle('a'.repeat(MAX_TEMPLATE_TITLE_LENGTH + 1));
    expect(result.ok).toBe(false);
    expect(result.error).toContain(String(MAX_TEMPLATE_TITLE_LENGTH));
  });

  it.each(['{', '}', '%', '\n', '\r'])('rejects the forbidden character %j', (char) => {
    const result = validateTemplateTitle(`Tiêu đề${char}x`);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('không được chứa');
  });

  it('accepts exactly the maximum length', () => {
    expect(validateTemplateTitle('a'.repeat(MAX_TEMPLATE_TITLE_LENGTH)).ok).toBe(true);
  });
});

describe('defaultSelectedKeys', () => {
  it('selects only absent base templates', () => {
    const templates = [
      template('templates/product.liquid', 'product', 'absent'),
      template('templates/collection.liquid', 'collection', 'inserted'),
      template('templates/page.liquid', 'page', 'absent'),
      template('templates/product-gift.liquid', 'product', 'absent'),
      template('templates/index.liquid', 'shop', 'absent'),
    ];
    expect(defaultSelectedKeys(templates)).toEqual([
      'templates/product.liquid',
      'templates/page.liquid',
    ]);
  });

  it('does not select a base template that already has a manual include', () => {
    const templates = [
      template('templates/product.liquid', 'product', 'manual'),
      template('templates/collection.liquid', 'collection', 'unsupported'),
    ];
    expect(defaultSelectedKeys(templates)).toEqual([]);
  });

  it('returns an empty array for missing data', () => {
    expect(defaultSelectedKeys(undefined)).toEqual([]);
    expect(defaultSelectedKeys(null)).toEqual([]);
    expect(defaultSelectedKeys([])).toEqual([]);
  });

  it('uses the base key list as the source of truth', () => {
    expect(DEFAULT_BASE_TEMPLATE_KEYS).toHaveLength(3);
  });
});

describe('sortTemplates', () => {
  it('orders by resource then name and keeps unknown resources last', () => {
    const sorted = sortTemplates([
      template('templates/index.liquid', 'shop', 'absent'),
      template('templates/page.liquid', 'page', 'absent'),
      template('templates/product-b.liquid', 'product', 'absent'),
      template('templates/product-a.liquid', 'product', 'absent'),
      template('templates/collection.liquid', 'collection', 'absent'),
      template('templates/special.liquid', 'widget', 'absent'),
    ]);
    expect(sorted.map((item) => item.name)).toEqual([
      'product-a.liquid',
      'product-b.liquid',
      'collection.liquid',
      'page.liquid',
      'index.liquid',
      'special.liquid',
    ]);
  });

  it('does not mutate the input', () => {
    const input = [
      template('templates/index.liquid', 'shop', 'absent'),
      template('templates/product.liquid', 'product', 'absent'),
    ];
    sortTemplates(input);
    expect(input[0].name).toBe('index.liquid');
  });
});

describe('groupTemplates', () => {
  it('groups templates by resource in display order with labels', () => {
    const groups = groupTemplates([
      template('templates/index.liquid', 'shop', 'absent'),
      template('templates/product.liquid', 'product', 'absent'),
      template('templates/page.liquid', 'page', 'absent'),
      template('templates/collection.liquid', 'collection', 'absent'),
    ]);
    expect(groups.map((group) => group.resource)).toEqual([
      'product',
      'collection',
      'page',
      'shop',
    ]);
    expect(groups.map((group) => group.label)).toEqual([
      'Sản phẩm',
      'Danh mục',
      'Trang',
      'Trang chủ',
    ]);
  });

  it('returns no groups for empty data and skips nothing else', () => {
    expect(groupTemplates(undefined)).toEqual([]);
    expect(groupTemplates([])).toEqual([]);
  });
});

describe('template status helpers', () => {
  it('maps known statuses and falls back for unknown ones', () => {
    expect(templateStatusMeta('inserted')).toEqual({ label: 'Đã chèn', color: 'green' });
    expect(templateStatusMeta('manual').label).toBe('Đã có (dán tay)');
    expect(templateStatusMeta('unsupported').color).toBe('default');
    expect(templateStatusMeta(undefined).label).toBe('Không rõ');
  });

  it('labels resources with a fallback to the raw value', () => {
    expect(resourceLabel('shop')).toBe('Trang chủ');
    expect(resourceLabel('widget')).toBe('widget');
    expect(resourceLabel(undefined)).toBe('');
  });

  it('only allows selecting absent templates', () => {
    expect(isSelectableTemplate({ status: 'absent' })).toBe(true);
    expect(isSelectableTemplate({ status: 'inserted' })).toBe(false);
    expect(isSelectableTemplate(null)).toBe(false);
  });
});

describe('describeInsertResults', () => {
  it('summarizes inserted templates', () => {
    const described = describeInsertResults([
      { key: 'templates/product.liquid', status: 'inserted' },
      { key: 'templates/page.liquid', status: 'inserted' },
    ]);
    expect(described.type).toBe('success');
    expect(described.summary).toBe('Đã chèn FAQ vào 2 template.');
    expect(described.details).toEqual([]);
  });

  it('lists skipped keys with the API reason', () => {
    const described = describeInsertResults([
      { key: 'templates/product.liquid', status: 'inserted' },
      { key: 'templates/collection.liquid', status: 'skipped', reason: 'Đã có FAQ' },
      { key: 'templates/page.liquid', status: 'skipped' },
    ]);
    expect(described.type).toBe('warning');
    expect(described.summary).toBe('Đã chèn FAQ vào 1 template, bỏ qua 2 template.');
    expect(described.details).toEqual([
      'templates/collection.liquid: Đã có FAQ',
      'templates/page.liquid: Không chèn được template này.',
    ]);
  });

  it('reports info when everything was skipped', () => {
    const described = describeInsertResults([
      { key: 'templates/page.liquid', status: 'skipped', reason: 'Đã có FAQ' },
    ]);
    expect(described.type).toBe('info');
    expect(described.summary).toBe('bỏ qua 1 template.');
  });

  it('handles empty results', () => {
    expect(describeInsertResults(undefined)).toEqual({
      type: 'info',
      summary: 'Không có template nào được chèn.',
      details: [],
    });
  });
});

describe('describeRemoveResults', () => {
  it('summarizes removed templates', () => {
    const described = describeRemoveResults([
      { key: 'templates/product.liquid', status: 'removed' },
    ]);
    expect(described.type).toBe('success');
    expect(described.summary).toBe('Đã gỡ FAQ khỏi 1 template.');
    expect(described.details).toEqual([]);
  });

  it('warns about manual includes that were left untouched', () => {
    const described = describeRemoveResults([
      { key: 'templates/product.liquid', status: 'removed' },
      { key: 'templates/collection.liquid', status: 'manual' },
    ]);
    expect(described.type).toBe('warning');
    expect(described.summary).toBe(
      'Đã gỡ FAQ khỏi 1 template, 1 template có include dán tay cần gỡ thủ công.'
    );
    expect(described.details).toEqual([
      'templates/collection.liquid: có include dán tay, cần gỡ thủ công.',
    ]);
  });

  it('mentions templates that no longer carry the block', () => {
    const described = describeRemoveResults([
      { key: 'templates/page.liquid', status: 'not_found' },
    ]);
    expect(described.type).toBe('info');
    expect(described.summary).toBe(
      '1 template không còn phần do ứng dụng chèn.'
    );
  });

  it('handles empty results', () => {
    expect(describeRemoveResults(null)).toEqual({
      type: 'info',
      summary: 'Không có template nào được gỡ.',
      details: [],
    });
  });
});
