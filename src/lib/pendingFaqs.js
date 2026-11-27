import { toFaqEntry } from "./faq";

// Haravan lists a freshly created page metafield only 60-90 s later, so a refetch right
// after create would drop the new question. Keep it client-side for this long at most.
export const PENDING_FAQ_TTL_MS = 3 * 60 * 1000;

export function faqPendingKey(type, objectid) {
  return `${type}:${String(objectid ?? "0")}`;
}

export function buildCreatedFaqEntry(values, metafield) {
  const hasValue =
    metafield?.value !== undefined &&
    metafield?.value !== null &&
    metafield?.value !== "";
  const fallbackValue = {
    question: values?.question ?? "",
    answer: values?.answer ?? "",
    categories: values?.categories ?? "",
    position: values?.position,
  };
  return toFaqEntry({
    ...metafield,
    type: values?.type,
    objectid: String(values?.objectid ?? "0"),
    value: hasValue ? metafield.value : JSON.stringify(fallbackValue),
  });
}

export function addPendingFaq(store, { type, objectid }, entry, now = Date.now()) {
  if (!entry?.id) return;
  const key = faqPendingKey(type, objectid);
  const list = (store.get(key) ?? []).filter(
    (item) => String(item.entry.id) !== String(entry.id)
  );
  list.push({ entry, createdAt: now });
  store.set(key, list);
}

export function mergePendingFaqs(store, { type, objectid }, entries, now = Date.now()) {
  const key = faqPendingKey(type, objectid);
  const pending = store.get(key);
  if (!pending || pending.length === 0) return entries;

  const serverIds = new Set(entries.map((entry) => String(entry.id)));
  const merged = [...entries];
  const kept = [];
  pending.forEach((item) => {
    const id = String(item.entry.id);
    // The server list now carries the item, or the grace window is over: stop merging.
    if (serverIds.has(id)) return;
    if (now - item.createdAt >= PENDING_FAQ_TTL_MS) return;
    kept.push(item);
    // The flag lets the list show a sync notice and hide actions the API would reject.
    merged.push({ ...item.entry, pending: true });
  });

  if (kept.length > 0) store.set(key, kept);
  else store.delete(key);
  return merged;
}

export function forgetPendingFaq(store, { type, objectid }, id) {
  const key = faqPendingKey(type, objectid);
  const pending = store.get(key);
  if (!pending) return;
  const kept = pending.filter((item) => String(item.entry.id) !== String(id));
  if (kept.length > 0) store.set(key, kept);
  else store.delete(key);
}

/** True while at least one FAQ is still waiting for Haravan to list it. */
export function hasPendingFaq(entries) {
  return Array.isArray(entries) && entries.some((entry) => entry.pending === true);
}
