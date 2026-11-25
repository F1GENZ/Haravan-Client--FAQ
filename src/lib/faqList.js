import { DEFAULT_CATEGORY, buildFaqPayload, parseFaqValue } from "./faq";

export const PREVIEW_MAX_LENGTH = 240;

export const BULK_ACTIONS = {
  delete: "delete",
  schemaOn: "schema-on",
  schemaOff: "schema-off",
};

const COMBINING_MARKS = /[\u0300-\u036f]/g;
const WHITESPACE = /\s+/g;
const BLOCK_TAGS = /<\/(p|div|li|ul|ol|h[1-6]|tr|td|th|blockquote)>|<br\s*\/?>/gi;

/** Search key: "Câu hỏi" and "cau hoi" both become "cau hoi". */
export function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/[đĐ]/g, (char) => (char === "đ" ? "d" : "D"))
    .toLowerCase()
    .replace(WHITESPACE, " ")
    .trim();
}

/** Stored answers are HTML; the list needs readable text for previews and search. */
export function htmlToText(html) {
  return String(html ?? "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(BLOCK_TAGS, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    // Last, so an encoded entity inside the text is not decoded twice.
    .replace(/&amp;/gi, "&")
    .replace(WHITESPACE, " ")
    .trim();
}

export function faqValue(entry) {
  return entry?.parsedValue ?? parseFaqValue(entry?.value);
}

export function entryCategory(entry) {
  return String(faqValue(entry)?.categories ?? "").trim() || DEFAULT_CATEGORY;
}

export function faqPlainAnswer(entry) {
  return htmlToText(faqValue(entry)?.answer);
}

export function faqPreviewText(entry, max = PREVIEW_MAX_LENGTH) {
  const text = faqPlainAnswer(entry);
  if (max <= 0 || text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

/** Every category present in the full list, sorted for the filter Select. */
export function faqCategories(entries) {
  const categories = new Set();
  (Array.isArray(entries) ? entries : []).forEach((entry) => {
    categories.add(entryCategory(entry));
  });
  return [...categories].sort((a, b) => a.localeCompare(b, "vi"));
}

export function hasActiveFilters({ query = "", category = "" } = {}) {
  return String(query).trim() !== "" || Boolean(category);
}

export function filterFaqEntries(entries, { query = "", category = "" } = {}) {
  const needle = normalizeSearchText(query);
  const list = Array.isArray(entries) ? entries : [];
  if (!needle && !category) return list;
  return list.filter((entry) => {
    if (category && entryCategory(entry) !== category) return false;
    if (!needle) return true;
    const question = normalizeSearchText(faqValue(entry)?.question);
    if (question.includes(needle)) return true;
    return normalizeSearchText(faqPlainAnswer(entry)).includes(needle);
  });
}

/**
 * Bulk runs sequentially and must never touch a row Haravan has not listed yet: the
 * update/delete call would 404 on an id the server does not know.
 */
export function planBulkAction(action, entries, selectedIds) {
  const selected = new Set(
    (Array.isArray(selectedIds) ? selectedIds : []).map((id) => String(id))
  );
  const runnable = [];
  const skipped = [];
  (Array.isArray(entries) ? entries : []).forEach((entry) => {
    if (!entry || !selected.has(String(entry.id))) return;
    if (entry.pending === true) skipped.push(entry);
    else runnable.push(entry);
  });
  return { action, runnable, skipped };
}

export function schemaUpdatePayload(type, objectid, entry, schema) {
  const value = faqValue(entry);
  return buildFaqPayload({
    type,
    objectid,
    metafieldid: entry?.id,
    key: entry?.key,
    question: value.question,
    answer: value.answer,
    categories: value.categories,
    schema,
    position: entry?.position,
  });
}

export const LIST_ERROR_TITLE = "Không tải được danh sách câu hỏi";
export const LIST_ERROR_TITLE_STALE =
  "Không làm mới được danh sách, đang hiển thị dữ liệu lần trước";

/**
 * The Alert title names the situation while the description must always add something:
 * a 5xx without a server message used to repeat the title verbatim.
 */
export function listErrorCopy({ hasEntries = false, status = 0, message = "" } = {}) {
  const detail = String(message ?? "").trim();
  const fallback =
    status === 0 || status >= 500
      ? "Máy chủ chưa phản hồi. Bấm Thử lại sau ít phút."
      : "Chưa tải được dữ liệu. Bấm Thử lại sau ít phút.";
  return {
    title: hasEntries ? LIST_ERROR_TITLE_STALE : LIST_ERROR_TITLE,
    description: detail || fallback,
  };
}

export function describeBulkResult({
  action,
  succeeded = 0,
  failures = [],
  skipped = 0,
  stopped = false,
}) {
  const parts = [];
  if (succeeded > 0) {
    parts.push(
      action === BULK_ACTIONS.delete
        ? `Đã xóa ${succeeded} câu hỏi`
        : `Đã cập nhật Schema cho ${succeeded} câu hỏi`
    );
  }
  if (skipped > 0) {
    parts.push(`bỏ qua ${skipped} câu (đang chờ đồng bộ hoặc không còn trong danh sách)`);
  }
  if (failures.length > 0) parts.push(`${failures.length} câu lỗi`);

  const summary = parts.length
    ? `${parts.join(", ")}.`
    : "Không có câu hỏi nào được xử lý.";

  return {
    type: failures.length > 0 ? "error" : succeeded > 0 ? "success" : "warning",
    summary: stopped ? `${summary} Đã dừng vì hết lượt dùng thử.` : summary,
  };
}
