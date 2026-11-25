export const DEFAULT_CATEGORY = "Không phân loại";

const FAQ_KEY_PATTERN = /^[a-z0-9_]{1,30}$/;

export function parseFaqValue(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** Mirrors the API cap (worker MAX_POSITION). */
export const MAX_FAQ_POSITION = 1000;

export function normalizePosition(value) {
  const position = Number(value);
  if (!Number.isInteger(position) || position < 1) return null;
  return position;
}

export function toFaqEntry(metafield) {
  const parsed = parseFaqValue(metafield?.value);
  const parsedValue = {
    ...parsed,
    schema: parsed.schema === true || parsed.schema === "true",
  };
  return {
    ...metafield,
    parsedValue,
    position: normalizePosition(parsedValue.position),
  };
}

export function toFaqEntries(fieldData) {
  if (!Array.isArray(fieldData)) return [];
  return fieldData.filter(Boolean).map(toFaqEntry);
}

function compareFaqEntries(a, b) {
  const positionA = a.position ?? Number.POSITIVE_INFINITY;
  const positionB = b.position ?? Number.POSITIVE_INFINITY;
  if (positionA !== positionB) return positionA < positionB ? -1 : 1;
  return String(a.id ?? "").localeCompare(String(b.id ?? ""), "en", {
    numeric: true,
  });
}

export function sortFaqEntries(entries) {
  return [...entries].sort(compareFaqEntries);
}

export function groupFaqs(entries) {
  const groups = new Map();
  entries.forEach((entry) => {
    const category =
      String(entry.parsedValue?.categories ?? "").trim() || DEFAULT_CATEGORY;
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(entry);
  });
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "vi"))
    .map(([category, items]) => ({ category, items }));
}

export function maxFaqPosition(entries) {
  return entries.reduce(
    (max, entry) => (entry.position && entry.position > max ? entry.position : max),
    0
  );
}

export function nextFaqPosition(entries) {
  return maxFaqPosition(entries) + 1;
}

export function createFaqKey(now = Date.now(), random = Math.random) {
  const time = Math.max(0, Math.floor(now)).toString(36);
  const suffix = Math.floor(random() * 36 ** 6)
    .toString(36)
    .padStart(6, "0");
  return `faq_${time}_${suffix}`.slice(0, 30);
}

export function isCompliantFaqKey(key) {
  return typeof key === "string" && FAQ_KEY_PATTERN.test(key);
}

export function buildFaqPayload({
  type,
  objectid,
  metafieldid,
  key,
  question,
  answer,
  categories,
  schema,
  position,
}) {
  const payload = {
    type,
    objectid: String(objectid ?? "0"),
    key,
    question: String(question ?? "").trim(),
    answer: String(answer ?? ""),
    categories: String(categories ?? "").trim(),
    schema: Boolean(schema),
  };
  if (metafieldid) payload.metafieldid = metafieldid;
  // A legacy item without a position must not invent one on update: the worker keeps the stored value.
  const normalizedPosition = normalizePosition(position);
  if (normalizedPosition !== null) payload.position = normalizedPosition;
  return payload;
}

export function buildDuplicatePayload(entry, position, key = createFaqKey()) {
  const value = entry.parsedValue ?? parseFaqValue(entry.value);
  return {
    type: entry.type,
    objectid: String(entry.objectid ?? "0"),
    key,
    question: `${String(value.question ?? "").trim()} (bản sao)`,
    answer: value.answer ?? "",
    categories: value.categories ?? "",
    schema: Boolean(value.schema),
    position: normalizePosition(position) ?? 1,
  };
}

/** Fields the answer dialog edits; a new question defaults to Schema on, matching the API. */
export function faqFormValues(entry) {
  const value = entry?.parsedValue ?? parseFaqValue(entry?.value);
  return {
    schema: entry ? Boolean(value.schema) : true,
    categories: value.categories ?? "",
    question: value.question ?? "",
    answer: value.answer ?? "",
  };
}

/**
 * TinyMCE rewrites what it is given (plain text becomes `<p>`, indentation and entity
 * encoding change), so the dialog adopts the editor's first render as the answer baseline:
 * an untouched FAQ stays clean and closing it never asks to discard changes.
 */
export function faqEditorBaseline(initial, editorContent) {
  return { ...initial, answer: String(editorContent ?? "") };
}

/**
 * Dirtiness is a value comparison, so a failed validation or a reverted edit is not a change.
 */
export function isFaqFormDirty(initial, values) {
  if (String(values?.question ?? "") !== String(initial?.question ?? "")) return true;
  if (String(values?.categories ?? "") !== String(initial?.categories ?? "")) return true;
  if (String(values?.answer ?? "") !== String(initial?.answer ?? "")) return true;
  // An unregistered switch reports undefined; that is not an edit.
  return (
    values?.schema !== undefined &&
    Boolean(values.schema) !== Boolean(initial?.schema)
  );
}

