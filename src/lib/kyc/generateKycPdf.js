// ─────────────────────────────────────────────────────────────────────────────
// Minimal, dependency-free PDF writer for the demo account-opening form.
//
// Everything runs in the browser: text is drawn with the base-14 Helvetica
// fonts, and the signature/selfie JPEGs are embedded as DCTDecode image
// XObjects (the same bytes the canvas produced). No server, no PDF library.
// ─────────────────────────────────────────────────────────────────────────────

const PAGE = { width: 595.28, height: 841.89, margin: 48 };

const FONT = { regular: 'F1', bold: 'F2' };

const latin1Bytes = (str) => {
  const out = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i += 1) out[i] = str.charCodeAt(i) & 0xff;
  return out;
};

const concat = (chunks) => {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  chunks.forEach((chunk) => {
    out.set(chunk, offset);
    offset += chunk.length;
  });
  return out;
};

/** WinAnsi-safe text: drop characters the base-14 fonts cannot show. */
const sanitize = (value) =>
  String(value ?? '')
    .replace(/₹/g, 'Rs. ')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[^\x20-\x7E]/g, '');

const escapeText = (value) => sanitize(value).replace(/([\\()])/g, '\\$1');

/** Rough Helvetica width table — good enough for wrapping at 9-13pt. */
const textWidth = (text, size) => sanitize(text).length * size * 0.5;

const wrap = (text, size, maxWidth) => {
  const words = sanitize(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (textWidth(candidate, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  return lines.length ? lines : [''];
};

const dataUrlToBytes = (dataUrl) => {
  if (!dataUrl) return null;
  const base64 = dataUrl.split(',')[1];
  if (!base64) return null;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

/** Reads width/height out of a JPEG's SOF marker. */
const jpegSize = (bytes) => {
  let offset = 2;
  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];

    const isSof =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      return {
        height: (bytes[offset + 5] << 8) | bytes[offset + 6],
        width: (bytes[offset + 7] << 8) | bytes[offset + 8],
      };
    }
    offset += 2 + length;
  }
  return { width: 0, height: 0 };
};

// ─── Content-stream builder ──────────────────────────────────────────────────
class PageBuilder {
  constructor() {
    this.ops = [];
    this.images = [];
    this.y = PAGE.height - PAGE.margin;
  }

  get contentWidth() {
    return PAGE.width - PAGE.margin * 2;
  }

  space(amount) {
    this.y -= amount;
  }

  hasRoom(amount) {
    return this.y - amount > PAGE.margin;
  }

  text(value, { size = 10, font = FONT.regular, x = PAGE.margin, color = '0 0 0' } = {}) {
    this.ops.push(
      `BT ${color} rg /${font} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${this.y.toFixed(2)} Tm (${escapeText(value)}) Tj ET`
    );
    this.y -= size * 1.45;
  }

  paragraph(value, { size = 9, font = FONT.regular, color = '0.25 0.25 0.25', width } = {}) {
    wrap(value, size, width ?? this.contentWidth).forEach((line) =>
      this.text(line, { size, font, color })
    );
  }

  rule(color = '0.85 0.85 0.85') {
    this.ops.push(
      `${color} RG 0.7 w ${PAGE.margin} ${this.y.toFixed(2)} m ${(PAGE.width - PAGE.margin).toFixed(2)} ${this.y.toFixed(2)} l S`
    );
    this.y -= 12;
  }

  /** Two-column label/value row. */
  row(label, value) {
    const labelSize = 9;
    const valueSize = 10;
    const columnX = PAGE.margin + this.contentWidth * 0.38;

    this.ops.push(
      `BT 0.42 0.42 0.42 rg /${FONT.regular} ${labelSize} Tf 1 0 0 1 ${PAGE.margin} ${this.y.toFixed(2)} Tm (${escapeText(label)}) Tj ET`
    );

    const lines = wrap(value, valueSize, PAGE.width - PAGE.margin - columnX);
    lines.forEach((line, index) => {
      const lineY = this.y - index * valueSize * 1.35;
      this.ops.push(
        `BT 0 0 0 rg /${FONT.regular} ${valueSize} Tf 1 0 0 1 ${columnX.toFixed(2)} ${lineY.toFixed(2)} Tm (${escapeText(line)}) Tj ET`
      );
    });

    this.y -= Math.max(valueSize * 1.45, lines.length * valueSize * 1.35 + 3);
  }

  image(bytes, { maxWidth, maxHeight, x = PAGE.margin }) {
    const { width, height } = jpegSize(bytes);
    if (!width || !height) return;

    const scale = Math.min(maxWidth / width, maxHeight / height);
    const drawWidth = width * scale;
    const drawHeight = height * scale;
    const name = `Im${this.images.length + 1}`;

    this.images.push({ name, bytes, width, height });
    this.y -= drawHeight;
    this.ops.push(
      `q ${drawWidth.toFixed(2)} 0 0 ${drawHeight.toFixed(2)} ${x.toFixed(2)} ${this.y.toFixed(2)} cm /${name} Do Q`
    );
    this.y -= 8;
  }

  build() {
    return this.ops.join('\n');
  }
}

// ─── Document assembly ──────────────────────────────────────────────────────
/**
 * Builds the demo KYC document.
 *
 * @param {object} params
 * @param {Array<{title: string, rows: Array<[string, string]>}>} params.sections
 * @param {string[]} params.declarations
 * @param {string} [params.signature] — JPEG data URL
 * @param {string} [params.selfie]    — JPEG data URL
 * @param {object} params.meta        — { documentId, generatedOn, applicantName }
 * @returns {Blob} application/pdf
 */
export function generateKycPdf({ sections = [], declarations = [], signature, selfie, meta = {} }) {
  const pages = [];
  let page = new PageBuilder();
  pages.push(page);

  const newPage = () => {
    page = new PageBuilder();
    pages.push(page);
    return page;
  };

  const ensure = (amount) => {
    if (!page.hasRoom(amount)) newPage();
  };

  // Header
  page.text('ALLVEST - ACCOUNT OPENING FORM (DEMO)', { size: 13, font: FONT.bold });
  page.paragraph(
    'Frontend demonstration document. Every value below is dummy test data and this form has no legal effect.',
    { size: 8 }
  );
  page.space(4);
  page.rule();
  page.row('Document ID', meta.documentId || '-');
  page.row('Generated on', meta.generatedOn || '-');
  page.row('Applicant', meta.applicantName || '-');
  page.space(6);

  // Detail sections
  sections.forEach((section) => {
    ensure(90);
    page.rule();
    page.text(section.title.toUpperCase(), { size: 11, font: FONT.bold });
    page.space(2);
    section.rows.forEach(([label, value]) => {
      ensure(30);
      page.row(label, value);
    });
    page.space(6);
  });

  // Declaration
  if (declarations.length) {
    ensure(90);
    page.rule();
    page.text('DECLARATION', { size: 11, font: FONT.bold });
    page.space(2);
    declarations.forEach((line) => {
      ensure(40);
      page.paragraph(`- ${line}`, { size: 9 });
      page.space(2);
    });
    page.space(6);
  }

  // Signature
  if (signature) {
    ensure(150);
    page.rule();
    page.text('E-SIGN / SIGNATURE', { size: 11, font: FONT.bold });
    page.space(4);
    const bytes = dataUrlToBytes(signature);
    if (bytes) page.image(bytes, { maxWidth: 240, maxHeight: 90 });
    page.paragraph('Signed digitally by the applicant during onboarding (simulated).', { size: 8 });
    page.space(6);
  }

  // Selfie last, per the document layout
  if (selfie) {
    const selfiePage = newPage();
    selfiePage.text('LIVE PHOTO VERIFICATION', { size: 11, font: FONT.bold });
    selfiePage.space(4);
    const bytes = dataUrlToBytes(selfie);
    if (bytes) selfiePage.image(bytes, { maxWidth: 220, maxHeight: 220 });
    selfiePage.paragraph(
      'Captured in-browser during the verification step. Not stored on any server.',
      { size: 8 }
    );
  }

  return serialize(pages);
}

function serialize(pages) {
  const objects = []; // 1-indexed by position
  const push = (body) => {
    objects.push(body);
    return objects.length; // object number
  };

  // Reserve 1 = catalog, 2 = pages tree (filled in after the pages exist).
  push(null);
  push(null);

  const fontRegular = push(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
  );
  const fontBold = push(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'
  );

  const pageRefs = [];

  pages.forEach((pageBuilder) => {
    const imageRefs = pageBuilder.images.map((image) => {
      const number = push({
        dict: `<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>`,
        stream: image.bytes,
      });
      return { name: image.name, number };
    });

    const content = latin1Bytes(pageBuilder.build());
    const contentNumber = push({
      dict: `<< /Length ${content.length} >>`,
      stream: content,
    });

    const xobjects = imageRefs.length
      ? ` /XObject << ${imageRefs.map((ref) => `/${ref.name} ${ref.number} 0 R`).join(' ')} >>`
      : '';

    const pageNumber = push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE.width.toFixed(2)} ${PAGE.height.toFixed(2)}] ` +
        `/Resources << /Font << /${FONT.regular} ${fontRegular} 0 R /${FONT.bold} ${fontBold} 0 R >>${xobjects} >> ` +
        `/Contents ${contentNumber} 0 R >>`
    );
    pageRefs.push(pageNumber);
  });

  objects[0] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[1] = `<< /Type /Pages /Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(' ')}] /Count ${pageRefs.length} >>`;

  // ── Byte assembly + xref table ──
  const chunks = [latin1Bytes('%PDF-1.4\n')];
  let offset = chunks[0].length;
  const offsets = [];

  objects.forEach((body, index) => {
    const number = index + 1;
    offsets[number] = offset;

    if (typeof body === 'string') {
      const bytes = latin1Bytes(`${number} 0 obj\n${body}\nendobj\n`);
      chunks.push(bytes);
      offset += bytes.length;
      return;
    }

    const head = latin1Bytes(`${number} 0 obj\n${body.dict}\nstream\n`);
    const tail = latin1Bytes('\nendstream\nendobj\n');
    chunks.push(head, body.stream, tail);
    offset += head.length + body.stream.length + tail.length;
  });

  const xrefStart = offset;
  const xrefLines = ['xref', `0 ${objects.length + 1}`, '0000000000 65535 f '];
  for (let number = 1; number <= objects.length; number += 1) {
    xrefLines.push(`${String(offsets[number]).padStart(10, '0')} 00000 n `);
  }
  chunks.push(
    latin1Bytes(
      `${xrefLines.join('\n')}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`
    )
  );

  return new Blob([concat(chunks)], { type: 'application/pdf' });
}

export default generateKycPdf;
