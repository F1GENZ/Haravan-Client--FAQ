import { DEFAULT_CATEGORY, buildFaqPayload, createFaqKey } from "./faq";

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export const QUESTION_MIN_LENGTH = 5;
export const QUESTION_MAX_LENGTH = 100;

export function escapeHtml(text) {
  return String(text ?? "").replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/**
 * The API returns plain text with "\n" between paragraphs while a stored FAQ answer is
 * HTML, so every non-empty line becomes an escaped paragraph.
 */
export function plainTextToHtml(text) {
  return String(text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

/** Mirrors the existing modal: a saved question always carries a category. */
export function normalizeSuggestionCategory(value) {
  return String(value ?? "").trim() || DEFAULT_CATEGORY;
}

/** Turns the API suggestions into editable rows; every row starts selected. */
export function toSuggestionDrafts(suggestions) {
  if (!Array.isArray(suggestions)) return [];
  return suggestions
    .filter((item) => item && typeof item === "object")
    .map((item, index) => ({
      id: `suggestion-${index}`,
      question: String(item.question ?? "").trim(),
      answer: String(item.answer ?? "").trim(),
      category: String(item.category ?? "").trim(),
      selected: true,
    }));
}

export function selectedSuggestionDrafts(drafts) {
  if (!Array.isArray(drafts)) return [];
  return drafts.filter((draft) => draft?.selected === true);
}

export function validateQuestion(question) {
  const text = String(question ?? "").trim();
  if (text.length < QUESTION_MIN_LENGTH) {
    return "Câu hỏi phải có ít nhất 5 ký tự.";
  }
  if (text.length > QUESTION_MAX_LENGTH) {
    return "Câu hỏi không được vượt quá 100 ký tự.";
  }
  return "";
}

export function validateAnswer(answer) {
  return String(answer ?? "").trim() === ""
    ? "Câu trả lời không được để trống."
    : "";
}

export function validateSuggestionDraft(draft) {
  return (
    validateQuestion(draft?.question) || validateAnswer(draft?.answer)
  );
}

export function suggestionToPayload({
  type,
  objectid,
  draft,
  position,
  key = createFaqKey(),
}) {
  return buildFaqPayload({
    type,
    objectid,
    key,
    question: draft?.question,
    answer: plainTextToHtml(draft?.answer),
    categories: normalizeSuggestionCategory(draft?.category),
    position,
  });
}
