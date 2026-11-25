import { describe, expect, it } from 'vitest';
import {
  FAQ_CSV_COLUMNS,
  escapeFormulaTextField,
  faqEntryToCsvRow,
  parseCsv,
  parseFaqCsv,
  serializeCsv,
  unescapeFormulaTextField,
  validateCsvHeader,
} from '../csv';

const COMPLEX_ROWS = [
  {
    question: 'Làm sao để đổi địa chỉ giao hàng?',
    answer:
      '<p>Vào <strong>Tài khoản</strong>, chọn "Địa chỉ", rồi bấm <em>Chỉnh sửa</em>.</p>',
    categories: 'Giao hàng, thanh toán',
    schema: true,
    position: 1,
  },
  {
    question: 'Có được kiểm hàng khi nhận?',
    answer: 'Có. Bạn nên quay video khi mở kiện hàng.\nĐiều này giúp xử lý khiếu nại nhanh hơn.',
    categories: 'Chính sách "đổi trả"',
    schema: false,
    position: 2,
  },
  {
    question: 'Câu hỏi có dấu phẩy, ngoặc "kép" và xuống dòng\nở giữa?',
    answer: '',
    categories: 'Khác',
    schema: false,
    position: 3,
  },
];

describe('serializeCsv', () => {
  it('starts with a UTF-8 BOM and the fixed header', () => {
    const csv = serializeCsv([]);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv.slice(1).split('\r\n')[0]).toBe(FAQ_CSV_COLUMNS.join(','));
  });

  it('quotes fields containing commas, quotes, and line breaks per RFC 4180', () => {
    const csv = serializeCsv([
      { question: 'a,b', answer: 'say "hi"', categories: 'x', schema: false, position: 1 },
    ]);
    const dataLine = csv.trimEnd().split('\r\n')[1];
    expect(dataLine).toBe('"a,b","say ""hi""",x,false,1');
  });
});

describe('csv round-trip', () => {
  it('preserves commas, quotes, newlines, HTML and Vietnamese text', () => {
    const csv = serializeCsv(COMPLEX_ROWS);
    const parsed = parseFaqCsv(csv);

    expect(parsed).toHaveLength(COMPLEX_ROWS.length);
    parsed.forEach((row, index) => {
      expect(row.error).toBeNull();
      expect(row.value.question).toBe(COMPLEX_ROWS[index].question.trim());
      expect(row.value.answer).toBe(COMPLEX_ROWS[index].answer);
      expect(row.value.categories).toBe(COMPLEX_ROWS[index].categories);
      expect(row.value.schema).toBe(COMPLEX_ROWS[index].schema);
      expect(row.value.position).toBe(COMPLEX_ROWS[index].position);
    });
  });

  it('round-trips LF-only input without the BOM', () => {
    const csv = serializeCsv(COMPLEX_ROWS).slice(1).replace(/\r\n/g, '\n');
    const parsed = parseFaqCsv(csv);
    expect(parsed.map((row) => row.value?.answer)).toEqual(
      COMPLEX_ROWS.map((row) => row.answer)
    );
  });

  it('serializes FAQ entries back into CSV rows', () => {
    const row = faqEntryToCsvRow({
      parsedValue: COMPLEX_ROWS[1],
      position: 7,
    });
    expect(row).toEqual({
      question: COMPLEX_ROWS[1].question,
      answer: COMPLEX_ROWS[1].answer,
      categories: COMPLEX_ROWS[1].categories,
      schema: false,
      position: 7,
    });
  });
});

describe('parseCsv', () => {
  it('keeps escaped quotes and embedded separators', () => {
    expect(parseCsv('a,"b""c"\r\nd,e\n')).toEqual([
      ['a', 'b"c'],
      ['d', 'e'],
    ]);
  });

  it('skips blank lines and a trailing newline', () => {
    expect(parseCsv('a,b\r\n\r\nc,d\r\n')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  it('rejects an unclosed quote', () => {
    expect(() => parseCsv('a,"b')).toThrow(/ngoặc kép/);
  });
});

describe('header validation', () => {
  it('accepts the exact column order with surrounding spaces', () => {
    expect(validateCsvHeader([' question ', 'answer', 'categories', 'schema', 'position'])).toBe(
      true
    );
  });

  it('rejects a reordered or missing column', () => {
    expect(validateCsvHeader(['answer', 'question', 'categories', 'schema', 'position'])).toBe(
      false
    );
    expect(validateCsvHeader(['question', 'answer'])).toBe(false);
  });

  it('fails the whole file when the header is wrong', () => {
    expect(() => parseFaqCsv('question,answer\n"a","b"\n')).toThrow(/Tiêu đề CSV/);
  });
});

describe('parseFaqCsv row validation', () => {
  it('reports invalid rows and keeps the valid ones', () => {
    const csv =
      '\uFEFFquestion,answer,categories,schema,position\r\n' +
      'Câu hỏi hợp lệ,Trả lời,Khác,false,1\r\n' +
      ',Thiếu câu hỏi,Khác,false,2\r\n' +
      'Câu hỏi lỗi schema,Trả lời,Khác,yes,3\r\n' +
      'Câu hỏi lỗi vị trí,Trả lời,Khác,true,abc\r\n' +
      'Câu hỏi thiếu cột,Trả lời\r\n';

    const rows = parseFaqCsv(csv);

    expect(rows).toHaveLength(5);
    expect(rows[0].value).toMatchObject({ question: 'Câu hỏi hợp lệ', position: 1 });
    expect(rows[1].error).toMatch(/Câu hỏi/);
    expect(rows[2].error).toMatch(/schema/);
    expect(rows[3].error).toMatch(/Vị trí/);
    expect(rows[4].error).toMatch(/Số cột/);
  });

  it('treats an empty position as null and accepts 1/0 for schema', () => {
    const csv =
      'question,answer,categories,schema,position\r\n' +
      'Câu hỏi,Trả lời,Khác,1,\r\n' +
      'Câu hỏi 2,Trả lời,Khác,0,5\r\n';
    const rows = parseFaqCsv(csv);
    expect(rows[0].value).toMatchObject({ schema: true, position: null });
    expect(rows[1].value).toMatchObject({ schema: false, position: 5 });
  });

  it('accepts the position cap and rejects anything above it', () => {
    const csv =
      'question,answer,categories,schema,position\r\n' +
      'Câu hỏi,Trả lời,Khác,1,1000\r\n' +
      'Câu hỏi 2,Trả lời,Khác,1,1001\r\n';
    const rows = parseFaqCsv(csv);
    expect(rows[0].value).toMatchObject({ position: 1000 });
    expect(rows[1].error).toMatch(/từ 1 đến 1000/);
  });

  it('rejects an empty file', () => {
    expect(() => parseFaqCsv('')).toThrow(/trống/);
  });
});

describe('formula injection guard', () => {
  it('prefixes every formula starter with an apostrophe', () => {
    expect(escapeFormulaTextField('=HYPERLINK(A1)')).toBe("'=HYPERLINK(A1)");
    expect(escapeFormulaTextField('+1')).toBe("'+1");
    expect(escapeFormulaTextField('-x')).toBe("'-x");
    expect(escapeFormulaTextField('@cmd')).toBe("'@cmd");
    expect(escapeFormulaTextField('\tcmd')).toBe("'\tcmd");
    expect(escapeFormulaTextField('\rcmd')).toBe("'\rcmd");
    expect(escapeFormulaTextField('safe')).toBe('safe');
  });

  it('escapes formula cells on export', () => {
    const csv = serializeCsv([
      {
        question: '=HYPERLINK(A1)',
        answer: '+1',
        categories: '-x',
        schema: false,
        position: 1,
      },
    ]);
    const dataLine = csv.trimEnd().split('\r\n')[1];
    expect(dataLine).toBe("'=HYPERLINK(A1),'+1,'-x,false,1");
  });

  it('round-trips formula text through export and import', () => {
    const rows = [
      {
        question: '=HYPERLINK(A1)',
        answer: '=SUM(A1:A2)',
        categories: '-danger',
        schema: false,
        position: 4,
      },
      {
        question: '@cmd',
        answer: '+1',
        categories: 'Khác',
        schema: true,
        position: 5,
      },
    ];

    const parsed = parseFaqCsv(serializeCsv(rows));

    expect(parsed[0].value).toMatchObject({
      question: '=HYPERLINK(A1)',
      answer: '=SUM(A1:A2)',
      categories: '-danger',
      position: 4,
    });
    expect(parsed[1].value).toMatchObject({
      question: '@cmd',
      answer: '+1',
      categories: 'Khác',
    });
  });

  it('strips exactly one guard apostrophe and keeps unrelated ones', () => {
    expect(unescapeFormulaTextField("'=HYPERLINK(A1)")).toBe('=HYPERLINK(A1)');
    expect(unescapeFormulaTextField("'hello")).toBe("'hello");
    expect(unescapeFormulaTextField("''=x")).toBe("''=x");
  });
});
