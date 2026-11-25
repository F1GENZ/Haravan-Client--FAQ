export const MAX_TEMPLATE_TITLE_LENGTH = 80;

export const RESOURCE_LABELS = {
  product: 'Sản phẩm',
  collection: 'Danh mục',
  page: 'Trang',
  shop: 'Trang chủ',
};

export const RESOURCE_ORDER = ['product', 'collection', 'page', 'shop'];

export const TEMPLATE_STATUS = {
  inserted: { label: 'Đã chèn', color: 'green' },
  manual: { label: 'Đã có (dán tay)', color: 'blue' },
  absent: { label: 'Chưa có', color: null },
  unsupported: { label: 'Không hỗ trợ', color: 'default' },
};

export const DEFAULT_BASE_TEMPLATE_KEYS = [
  'templates/product.liquid',
  'templates/collection.liquid',
  'templates/page.liquid',
];

// The title becomes a Liquid string literal; braces, % and newlines would break it.
const FORBIDDEN_TITLE_PATTERN = /[{}%\r\n]/;

export function resourceLabel(resource) {
  return RESOURCE_LABELS[resource] ?? resource ?? '';
}

export function templateStatusMeta(status) {
  return TEMPLATE_STATUS[status] ?? { label: status || 'Không rõ', color: null };
}

export function isSelectableTemplate(template) {
  return template?.status === 'absent';
}

function resourceRank(resource) {
  const index = RESOURCE_ORDER.indexOf(resource);
  return index === -1 ? RESOURCE_ORDER.length : index;
}

export function sortTemplates(templates) {
  return [...(Array.isArray(templates) ? templates : [])].sort((a, b) => {
    const diff = resourceRank(a?.resource) - resourceRank(b?.resource);
    if (diff !== 0) return diff;
    return String(a?.name ?? '').localeCompare(String(b?.name ?? ''));
  });
}

export function groupTemplates(templates) {
  const groups = new Map();
  for (const template of sortTemplates(templates)) {
    const resource = template?.resource ?? 'shop';
    if (!groups.has(resource)) groups.set(resource, []);
    groups.get(resource).push(template);
  }
  return [...groups.entries()].map(([resource, items]) => ({
    resource,
    label: resourceLabel(resource),
    templates: items,
  }));
}

export function defaultSelectedKeys(templates) {
  const list = Array.isArray(templates) ? templates : [];
  return DEFAULT_BASE_TEMPLATE_KEYS.filter((key) => {
    const template = list.find((item) => item?.key === key);
    return template != null && isSelectableTemplate(template);
  });
}

export function validateTemplateTitle(raw) {
  const value = String(raw ?? '').trim();
  if (!value) return { ok: true, value: '', error: null };
  if (value.length > MAX_TEMPLATE_TITLE_LENGTH) {
    return {
      ok: false,
      value,
      error: `Tiêu đề tối đa ${MAX_TEMPLATE_TITLE_LENGTH} ký tự.`,
    };
  }
  if (FORBIDDEN_TITLE_PATTERN.test(value)) {
    return {
      ok: false,
      value,
      error: 'Tiêu đề không được chứa { } % hoặc xuống dòng.',
    };
  }
  return { ok: true, value, error: null };
}

export function describeInsertResults(results) {
  const list = Array.isArray(results) ? results : [];
  const inserted = list.filter((item) => item?.status === 'inserted').length;
  const skipped = list.filter((item) => item?.status === 'skipped');

  const parts = [];
  if (inserted) parts.push(`Đã chèn FAQ vào ${inserted} template`);
  if (skipped.length) parts.push(`bỏ qua ${skipped.length} template`);

  return {
    type: inserted === 0 ? 'info' : skipped.length ? 'warning' : 'success',
    summary: parts.length
      ? `${parts.join(', ')}.`
      : 'Không có template nào được chèn.',
    details: skipped.map(
      (item) => `${item.key}: ${item.reason || 'Không chèn được template này.'}`
    ),
  };
}

export function describeRemoveResults(results) {
  const list = Array.isArray(results) ? results : [];
  const removed = list.filter((item) => item?.status === 'removed').length;
  const manual = list.filter((item) => item?.status === 'manual');
  const missing = list.filter((item) => item?.status === 'not_found').length;

  const parts = [];
  if (removed) parts.push(`Đã gỡ FAQ khỏi ${removed} template`);
  if (missing) parts.push(`${missing} template không còn phần do ứng dụng chèn`);
  if (manual.length) {
    parts.push(`${manual.length} template có include dán tay cần gỡ thủ công`);
  }

  return {
    type: manual.length ? 'warning' : removed ? 'success' : 'info',
    summary: parts.length
      ? `${parts.join(', ')}.`
      : 'Không có template nào được gỡ.',
    details: manual.map(
      (item) => `${item.key}: có include dán tay, cần gỡ thủ công.`
    ),
  };
}
