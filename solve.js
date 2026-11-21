function endOfUnquoted(text, start) {
  for (let i = start; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code === 44 || code === 10 || code === 13) return i;
  }
  return text.length;
}

function endOfQuoted(text, start) {
  let end = text.indexOf('"', start);
  while (end !== -1 && text.charCodeAt(end + 1) === 34) {
    end = text.indexOf('"', end + 2);
  }
  return end;
}

function readComplexRecord(text, offset, line, row, errors) {
  const recordLine = line;
  const fields = [];
  let quoted = false;

  for (;;) {
    const start = offset;
    quoted = text.charCodeAt(start) === 34;
    let prefix = '';
    let closed = false;

    if (quoted) {
      const close = endOfQuoted(text, start + 1);
      if (close === -1) {
        errors.push({ code: 'unterminated_quote', line: recordLine, row });
      } else {
        prefix = text.slice(start + 1, close).replace(/""|\r\n?|\n/g, (token) => {
          if (token === '""') return '"';
          line++;
          return '\n';
        });
        offset = close + 1;
        closed = true;
      }
    }

    let end = endOfUnquoted(text, offset);
    let tail = text.slice(offset, end);
    let delimiter = text.charCodeAt(end);
    while (delimiter === 13 && text.charCodeAt(end + 1) !== 10) {
      errors.push({ code: 'stray_cr', line: recordLine, row });
      offset = end + 1;
      end = endOfUnquoted(text, offset);
      tail += text.slice(offset, end);
      delimiter = text.charCodeAt(end);
    }

    if (closed && tail.length !== 0) {
      errors.push({ code: 'quote_junk', line: recordLine, row });
    }
    fields.push(closed ? prefix + tail : tail);

    if (delimiter === 44) {
      offset = end + 1;
      continue;
    }
    offset = end;
    if (delimiter === 10 || delimiter === 13) {
      offset += delimiter === 10 ? 1 : 2;
      line++;
    }
    return { fields, offset, line, empty: fields.length === 1 && fields[0] === '' && !quoted };
  }
}

export function run(input) {
  const text = String(input.text);
  const length = text.length;
  const header = input.header === true;
  const rows = [];
  const errors = [];
  let columns = null;
  let width = 0;
  let line = 1;
  let offset = text.charCodeAt(0) === 0xFEFF ? 1 : 0;
  let nextQuote = -1;
  let nextCarriageReturn = -1;

  while (offset < length) {
    const first = text.charCodeAt(offset);
    if (first === 10 || (first === 13 && text.charCodeAt(offset + 1) === 10)) {
      offset += first === 10 ? 1 : 2;
      line++;
      continue;
    }

    const recordLine = line;
    const recordRow = header && columns === null ? null : rows.length;
    const newline = text.indexOf('\n', offset);
    let end = newline === -1 ? length : newline;
    if (newline !== -1 && text.charCodeAt(end - 1) === 13) end--;

    // Carry the next quotes and CRs forward so long stretches without them are searched once.
    if (nextQuote < offset) {
      nextQuote = text.indexOf('"', offset);
      if (nextQuote === -1) nextQuote = length;
    }
    if (nextCarriageReturn < offset) {
      nextCarriageReturn = text.indexOf('\r', offset);
      if (nextCarriageReturn === -1) nextCarriageReturn = length;
    }

    let fields;
    if (nextQuote >= end && nextCarriageReturn >= end) {
      fields = text.slice(offset, end).split(',');
      offset = newline === -1 ? length : newline + 1;
      if (newline !== -1) line++;
    } else {
      const record = readComplexRecord(text, offset, line, recordRow, errors);
      offset = record.offset;
      line = record.line;
      if (record.empty) continue;
      fields = record.fields;
    }

    if (width === 0) width = fields.length;

    if (header && columns === null) {
      columns = fields;
      continue;
    }
    if (fields.length < width) {
      errors.push({ code: 'short_row', line: recordLine, row: recordRow, fields: fields.length });
      while (fields.length < width) fields.push('');
    } else if (fields.length > width) {
      errors.push({ code: 'long_row', line: recordLine, row: recordRow, extra: fields.splice(width) });
    }
    rows.push(fields);
  }

  return { columns: header ? (columns ?? []) : null, rows, errors };
}
