// Builds the downloadable account-opening PDF: the generated demo form, with
// the first pages of the CVL KRA individual KYC form appended after it.
//
// Still client-only — the KRA form is a static asset in /public and pdf-lib
// stitches the two together in the browser.

import { PDFDocument } from 'pdf-lib';
import { generateKycPdf } from '@/lib/kyc/generateKycPdf';

export const KRA_FORM = Object.freeze({
  src: '/assets/docs/cvl-kra-kyc-form.pdf',
  // Only the applicant-facing pages of the KRA form are attached.
  pageCount: 6,
});

/** The KRA form trimmed to the pages that are attached — used for preview too. */
export async function buildKraFormPdf() {
  const response = await fetch(KRA_FORM.src);
  if (!response.ok) throw new Error('The KRA form could not be loaded.');

  const source = await PDFDocument.load(await response.arrayBuffer());
  const trimmed = await PDFDocument.create();
  const indices = Array.from(
    { length: Math.min(KRA_FORM.pageCount, source.getPageCount()) },
    (_, index) => index
  );
  const pages = await trimmed.copyPages(source, indices);
  pages.forEach((page) => trimmed.addPage(page));

  return new Blob([await trimmed.save()], { type: 'application/pdf' });
}

/**
 * @param {object} document — output of buildKycDocument()
 * @param {object} [media]  — { signature, selfie } JPEG data URLs
 * @returns {Promise<Blob>} the merged application/pdf
 */
export async function buildDownloadablePdf(document, { signature, selfie } = {}) {
  const detailsBlob = generateKycPdf({
    sections: document.sections,
    declarations: document.declarations,
    meta: document.meta,
    signature,
    selfie,
  });

  const merged = await PDFDocument.create();

  // The KRA form opens the document; a missing or unreadable copy must not cost
  // the applicant their own details, so the attachment is best-effort.
  try {
    const kra = await PDFDocument.load(await (await buildKraFormPdf()).arrayBuffer());
    const kraPages = await merged.copyPages(kra, kra.getPageIndices());
    kraPages.forEach((page) => merged.addPage(page));
  } catch {
    // Ignored on purpose — the applicant's own details still follow.
  }

  const details = await PDFDocument.load(await detailsBlob.arrayBuffer());
  const detailPages = await merged.copyPages(details, details.getPageIndices());
  detailPages.forEach((page) => merged.addPage(page));

  return new Blob([await merged.save()], { type: 'application/pdf' });
}

/** Saves the merged PDF through a temporary object URL. */
export async function downloadKycPdf(document, media) {
  const blob = await buildDownloadablePdf(document, media);
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');

  link.href = url;
  link.download = `${document.meta?.documentId || 'account-opening-form'}.pdf`;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoked on the next tick so the download has started.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default downloadKycPdf;
