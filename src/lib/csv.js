export const FAQ_CSV_COLUMNS = [
  "question",
  "answer",
  "categories",
  "schema",
  "position",
];

const UTF8_BOM = "\uFEFF";
const ROW_SEPARATOR = "\r\n";

function serializeField(value) {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function serializeCsv(rows) {
  const lines = [FAQ_CSV_COLUMNS.join(",")];
  rows.forEach((row) => {
    lines.push(FAQ_CSV_COLUMNS.map((column) => serializeField(row[column])).join(","));
  });
  return UTF8_BOM + lines.join(ROW_SEPARATOR) + ROW_SEPARATOR;
}

export function parseCsv(text) {
  if (typeof text !== "string") {
    throw new Error("Nội dung CSV không hợp lệ.");
  }

  const source = text.startsWith(UTF8_BOM) ? text.slice(1) : text;
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (inQuotes) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      if (field.length === 0) {
        inQuotes = true;
      } else {
        field += char;
      }
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\r" || char === "\n") {
      if (char === "\r" && source[index + 1] === "\n") index += 1;
      row.push(field);
      field = "";
      if (!(row.length === 1 && row[0] === "")) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  if (inQuotes) {
    throw new Error("File CSV không hợp lệ: dấu ngoặc kép chưa được đóng.");
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (!(row.length === 1 && row[0] === "")) rows.push(row);
  }

  return rows;
}

export function validateCsvHeader(header) {
  const normalized = (header ?? []).map((cell) =>
    String(cell).trim().toLowerCase()
  );
  return normalized.join(",") === FAQ_CSV_COLUMNS.join(",");
}

export function parseFaqCsv(text) {
  const matrix = parseCsv(text);
  if (matrix.length === 0) {
    throw new Error("File CSV trống.");
  }
  if (!validateCsvHeader(matrix[0])) {
    throw new Error(
      `Tiêu đề CSV không hợp lệ. Cột bắt buộc theo thứ tự: ${FAQ_CSV_COLUMNS.join(", ")}.`
    );
  }

  const rows = [];
  for (let index = 1; index < matrix.length; index += 1) {
    const cells = matrix[index];
    const line = index + 1;

    if (cells.length !== FAQ_CSV_COLUMNS.length) {
      rows.push({ line, error: "Số cột không khớp với tiêu đề." });
      continue;
    }

    const [question, answer, categories, schemaRaw, positionRaw] = cells;
    if (!String(question).trim()) {
      rows.push({ line, error: "Câu hỏi không được để trống." });
      continue;
    }

    const schemaText = String(schemaRaw).trim().toLowerCase();
    if (!["", "true", "false", "1", "0"].includes(schemaText)) {
      rows.push({ line, error: `Giá trị schema không hợp lệ: "${schemaRaw}".` });
      continue;
    }

    const positionText = String(positionRaw).trim();
    let position = null;
    if (positionText) {
      const parsed = Number(positionText);
      if (!Number.isInteger(parsed) || parsed < 1) {
        rows.push({ line, error: `Vị trí không hợp lệ: "${positionRaw}".` });
        continue;
      }
      position = parsed;
    }

    rows.push({
      line,
      error: null,
      value: {
        question: String(question).trim(),
        answer: String(answer),
        categories: String(categories).trim(),
        schema: schemaText === "true" || schemaText === "1",
        position,
      },
    });
  }

  return rows;
}

export function faqEntryToCsvRow(entry) {
  const value = entry.parsedValue ?? {};
  return {
    question: value.question ?? "",
    answer: value.answer ?? "",
    categories: value.categories ?? "",
    schema: Boolean(value.schema),
    position: entry.position ?? "",
  };
}
