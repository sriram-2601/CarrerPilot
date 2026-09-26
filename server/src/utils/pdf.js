export function textToPdf(text = '', options = {}) {
  // 1. Sanitize text: strip non-Latin-1 and irregular control characters
  const sanitized = String(text)
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // 2. Word wrapping: wrap lines to maxChars (~95 chars)
  const maxChars = options.maxCharsPerLine || 92;
  const rawLines = sanitized.split('\n');
  const wrappedLines = [];

  for (const rawLine of rawLines) {
    if (rawLine.length <= maxChars) {
      wrappedLines.push(rawLine);
    } else {
      const words = rawLine.split(' ');
      let current = '';
      for (const word of words) {
        if ((current + (current ? ' ' : '') + word).length <= maxChars) {
          current += (current ? ' ' : '') + word;
        } else {
          if (current) wrappedLines.push(current);
          if (word.length > maxChars) {
            let remaining = word;
            while (remaining.length > maxChars) {
              wrappedLines.push(remaining.slice(0, maxChars));
              remaining = remaining.slice(maxChars);
            }
            current = remaining;
          } else {
            current = word;
          }
        }
      }
      if (current) wrappedLines.push(current);
    }
  }

  // 3. Pagination: ~46 lines per page
  const linesPerPage = options.linesPerPage || 46;
  const pages = [];
  for (let i = 0; i < wrappedLines.length; i += linesPerPage) {
    pages.push(wrappedLines.slice(i, i + linesPerPage));
  }
  if (pages.length === 0) {
    pages.push(['(Empty document)']);
  }

  const escapePdf = str => {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  };

  const numPages = pages.length;
  const pageObjIds = [];
  for (let p = 0; p < numPages; p++) {
    pageObjIds.push(4 + p * 2);
  }

  const objects = [];

  // 1 0 obj: Catalog
  objects[1] = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;

  // 2 0 obj: Pages
  const kidsStr = pageObjIds.map(id => `${id} 0 R`).join(' ');
  objects[2] = `2 0 obj\n<< /Type /Pages /Kids [${kidsStr}] /Count ${numPages} >>\nendobj\n`;

  // 3 0 obj: Font
  objects[3] = `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n`;

  // Pages & Streams
  for (let p = 0; p < numPages; p++) {
    const pageId = 4 + p * 2;
    const contentId = 5 + p * 2;
    const pageLines = pages[p];

    // Page object
    objects[pageId] = `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents ${contentId} 0 R /Resources << /Font << /F1 3 0 R >> >> >>\nendobj\n`;

    // Stream content
    let streamText = `BT\n/F1 10 Tf\n45 800 Td\n14 TL\n`;
    for (let l = 0; l < pageLines.length; l++) {
      const line = escapePdf(pageLines[l]);
      if (l === 0) {
        streamText += `(${line}) Tj\n`;
      } else {
        streamText += `T* (${line}) Tj\n`;
      }
    }
    streamText += `ET\n`;

    const streamLength = Buffer.byteLength(streamText, 'latin1');
    objects[contentId] = `${contentId} 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamText}endstream\nendobj\n`;
  }

  // Construct PDF body and record exact byte offsets in latin1
  let pdf = `%PDF-1.4\n%\xE2\xE3\xCF\xD3\n`;
  const offsets = [];

  for (let id = 1; id < objects.length; id++) {
    offsets[id] = Buffer.byteLength(pdf, 'latin1');
    pdf += objects[id];
  }

  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  const totalObjs = objects.length;

  // Cross-reference table: each entry must be strictly 20 bytes: 10 + 1 + 5 + 1 + 1 + 1 + 1 = 20
  let xref = `xref\n0 ${totalObjs}\n0000000000 65535 f \n`;
  for (let id = 1; id < totalObjs; id++) {
    const offsetStr = String(offsets[id]).padStart(10, '0');
    xref += `${offsetStr} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${totalObjs} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  pdf += xref + trailer;

  return Buffer.from(pdf, 'latin1');
}
