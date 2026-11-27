const OWNER_LABELS = {
  products: "Sản phẩm",
  collections: "Danh mục",
  pages: "Trang",
  shop: "Shop",
};

export const QUESTION_STATES = ["pending", "answered", "dismissed"];

export function ownerLabel(question) {
  const type = OWNER_LABELS[question?.owner_type] ?? "Shop";
  const title = (question?.owner_title ?? "").trim();
  if (type === "Shop") return "Shop";
  return title ? `${type}: ${title}` : type;
}

export function timeAgo(value, now = Date.now()) {
  const ts = Number(value);
  if (!Number.isFinite(ts)) return "";
  const diff = Math.max(0, now - ts);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "vừa xong";
  if (diff < hour) return `${Math.floor(diff / minute)} phút trước`;
  if (diff < day) return `${Math.floor(diff / hour)} giờ trước`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} ngày trước`;
  return new Date(ts).toLocaleDateString("vi-VN");
}

/** TinyMCE leaves `<p><br></p>` for a cleared editor; publishing needs real text. */
export function hasAnswerText(html) {
  const text = (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .trim();
  return text.length > 0;
}

/** Deep link from a question to the FAQ list of its owner resource. */
export function ownerFaqPath(question) {
  const type = question?.owner_type;
  const id = String(question?.owner_id ?? "").trim();
  if (!type || type === "shop" || !id || id === "0") return null;
  return `/${type}?id=${encodeURIComponent(id)}`;
}
