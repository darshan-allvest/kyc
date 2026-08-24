'use client';

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import Text from '@/components/common/Text';
import { KYC_TYPO } from '@/constants/kycConstants';
import { mockStampPaper } from '@/services/kyc/mockKycData';

// A4 — a sheet is 1.414x as tall as it is wide.
const SHEET_RATIO = 1.414;
// Spacing the sheet layout uses, mirrored by the packer: gap between blocks
// (space-y-4), between rows within a block (space-y-1.5), heading margin.
const BLOCK_GAP = 16;
const ROW_GAP = 6;
// Heading margin (mb-2) — rect heights exclude margins, so add it back.
const TITLE_MARGIN = 8;

/** Flattens the document into blocks of individually breakable items. */
function buildBlocks(document, signature, selfie) {
  const blocks = document.sections.map((section) => ({
    id: section.id,
    kind: 'section',
    title: section.title,
    items: (section.rows ?? []).map((row) => ({ key: row[0], row })),
  }));

  if (document.declarations?.length) {
    blocks.push({
      id: 'declaration-text',
      kind: 'declarations',
      title: 'Declaration',
      items: document.declarations.map((line) => ({ key: line, line })),
    });
  }
  if (signature) {
    blocks.push({ id: 'signature', kind: 'signature', title: 'E-Sign / Signature', items: [{ key: 'signature' }] });
  }
  if (selfie) {
    blocks.push({ id: 'selfie', kind: 'selfie', title: 'Live photo verification', items: [{ key: 'selfie' }] });
  }
  return blocks;
}

/**
 * Fills pages with whole items only: an item is never cut by a page edge, and a
 * block that runs over continues on the next page under its own heading.
 */
function packPages(blocks, budget, heightOf) {
  const pages = [];
  let current = [];
  let used = 0;

  const flush = () => {
    if (current.length) pages.push({ blocks: current });
    current = [];
    used = 0;
  };

  for (const block of blocks) {
    const titleHeight = heightOf(`title:${block.id}`) + TITLE_MARGIN;
    const itemHeights = block.items.map((item, index) => heightOf(`item:${block.id}:${index}`));

    let index = 0;
    let continued = false;

    while (index < block.items.length) {
      const gap = current.length ? BLOCK_GAP : 0;
      const available = budget - used - gap - titleHeight;

      // Not even the heading plus its first item fits — start a fresh page.
      if (available < itemHeights[index] && current.length) {
        flush();
        continue;
      }

      const taken = [];
      let takenHeight = 0;
      while (index < block.items.length) {
        const cost = itemHeights[index] + (taken.length ? ROW_GAP : 0);
        if (taken.length && takenHeight + cost > available) break;
        taken.push(block.items[index]);
        takenHeight += cost;
        index += 1;
      }

      current.push({ ...block, continued, items: taken });
      used += gap + titleHeight + takenHeight;
      continued = true;

      if (index < block.items.length) flush();
    }
  }

  flush();
  // The stamp paper the form is executed on always closes the document.
  pages.push({ blocks: [{ id: 'stamp', kind: 'stamp', title: 'Executed on stamp paper', items: [] }] });
  return pages;
}

function BlockTitle({ children, continued, measureKey }) {
  return (
    <div className="mb-2 border-b border-gray-200 pb-1" data-measure={measureKey}>
      <Text className="text-[12px] font-semibold uppercase tracking-wide" color="text-gray-700">
        {children}
        {continued && <span className="font-normal normal-case text-gray-400"> (continued)</span>}
      </Text>
    </div>
  );
}

function DetailRow({ row, measureKey }) {
  const [label, value] = row;
  return (
    <div className="flex items-start justify-between gap-4" data-measure={measureKey}>
      <dt className="min-w-0 flex-1">
        <Text as="span" className={KYC_TYPO.body} color="text-gray-500">
          {label}
        </Text>
      </dt>
      <dd className="max-w-[45%] shrink-0 text-right">
        <Text as="span" className="text-[12px] font-medium" color="text-black">
          {value}
        </Text>
      </dd>
    </div>
  );
}

function DeclarationLine({ line, measureKey }) {
  return (
    <li className="flex gap-2" data-measure={measureKey}>
      <span aria-hidden="true" className="text-gray-400">
        &bull;
      </span>
      <Text className={KYC_TYPO.body} color="text-gray-700">
        {line}
      </Text>
    </li>
  );
}

function MediaItem({ kind, src, measureKey }) {
  const isSignature = kind === 'signature';
  return (
    <div data-measure={measureKey}>
      {/* Local data URLs from the canvas / camera — next/image cannot help. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={isSignature ? 'Applicant signature' : 'Applicant selfie captured during verification'}
        className={isSignature ? 'h-20 w-auto' : 'size-32 rounded-lg object-cover'}
      />
      <Text className={cn(KYC_TYPO.body, 'mt-1')} color="text-gray-500">
        {isSignature
          ? 'Signed digitally during onboarding (simulated).'
          : 'Captured in-browser. Not stored on any server.'}
      </Text>
    </div>
  );
}

function StampPage() {
  return (
    <section className="flex h-full flex-col">
      <BlockTitle>Executed on stamp paper</BlockTitle>
      <Text className={KYC_TYPO.body} color="text-gray-600">
        {mockStampPaper.kind} · {mockStampPaper.value} · {mockStampPaper.state} · Serial{' '}
        {mockStampPaper.serial}
      </Text>
      <div className="mt-3 flex flex-1 items-start justify-center">
        {/* Static asset sized by the sheet — the optimizer adds nothing here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mockStampPaper.image}
          alt={`${mockStampPaper.kind} stamp paper of ${mockStampPaper.value}`}
          className="max-h-full w-full max-w-[320px] rounded border border-gray-200 object-contain"
        />
      </div>
    </section>
  );
}

function Block({ block, signature, selfie }) {
  if (block.kind === 'stamp') return <StampPage />;

  return (
    <section>
      <BlockTitle continued={block.continued}>{block.title}</BlockTitle>
      {block.kind === 'section' && (
        <dl className="space-y-1.5">
          {block.items.map((item) => (
            <DetailRow key={item.key} row={item.row} />
          ))}
        </dl>
      )}
      {block.kind === 'declarations' && (
        <ul className="space-y-1.5">
          {block.items.map((item) => (
            <DeclarationLine key={item.key} line={item.line} />
          ))}
        </ul>
      )}
      {(block.kind === 'signature' || block.kind === 'selfie') && (
        <MediaItem kind={block.kind} src={block.kind === 'signature' ? signature : selfie} />
      )}
    </section>
  );
}

function SheetChrome({ meta, page, total, children, className, sheetRef }) {
  return (
    <article
      ref={sheetRef}
      className={cn(
        'kyc-doc-sheet grid rounded-lg border border-gray-200 bg-white text-black shadow-sm',
        className
      )}
    >
      {/* Zero-width spacer holds the sheet to A4 proportions; content sharing
          the grid cell can still push it taller rather than being clipped. */}
      <span aria-hidden="true" className="col-start-1 row-start-1 w-0 pt-[141.4%]" />

      <div className="col-start-1 row-start-1 flex flex-col p-4 sm:p-6">
        <header
          data-sheet-header
          className="mb-3 flex items-baseline justify-between gap-3 border-b border-gray-300 pb-2"
        >
          <Text className="text-[12px] font-semibold" color="text-black">
            Allvest — Account opening form (demo)
          </Text>
          <Text className="text-[12px]" color="text-gray-500">
            {meta.documentId}
          </Text>
        </header>

        <div data-sheet-body className="flex-1 space-y-4">
          {children}
        </div>

        <footer
          data-sheet-footer
          className="mt-3 flex items-baseline justify-between gap-3 border-t border-gray-200 pt-2"
        >
          <Text className="text-[12px]" color="text-gray-500">
            {meta.applicantName} · Generated {meta.generatedOn} · Dummy data only
          </Text>
          <Text className="text-[12px] font-medium" color="text-gray-600">
            {page && total ? `Page ${page} of ${total}` : ' '}
          </Text>
        </footer>
      </div>
    </article>
  );
}

/**
 * DocumentPreview — on-screen version of the generated account-opening form,
 * laid out as A4 sheets. Every block is measured at the real sheet width first,
 * so pages break between rows instead of through them.
 */
export default function DocumentPreview({ document, signature, selfie, className }) {
  const { meta } = document;
  const blocks = useMemo(
    () => buildBlocks(document, signature, selfie),
    [document, signature, selfie]
  );

  const measureRef = useRef(null);
  const [pages, setPages] = useState(null);

  const measure = useCallback(() => {
    const sheet = measureRef.current;
    if (!sheet) return;

    const width = sheet.getBoundingClientRect().width;
    if (!width) return;

    const body = sheet.querySelector('[data-sheet-body]');
    const header = sheet.querySelector('[data-sheet-header]');
    const footer = sheet.querySelector('[data-sheet-footer]');
    if (!body || !header || !footer) return;

    const frame = body.parentElement;
    const padding = parseFloat(getComputedStyle(frame).paddingTop) * 2;
    const chrome =
      header.getBoundingClientRect().height +
      footer.getBoundingClientRect().height +
      12 + // header mb-3
      12; // footer mt-3
    const budget = width * SHEET_RATIO - padding - chrome;

    const heights = new Map();
    body.querySelectorAll('[data-measure]').forEach((node) => {
      heights.set(node.dataset.measure, node.getBoundingClientRect().height);
    });

    setPages(packPages(blocks, budget, (key) => heights.get(key) ?? 0));
  }, [blocks]);

  useLayoutEffect(() => {
    measure();
    const sheet = measureRef.current;
    if (!sheet || typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver(() => measure());
    observer.observe(sheet);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <div
      className={cn(
        'kyc-doc-scroll relative max-h-[60vh] overflow-y-auto rounded-xl bg-gray-100 p-3 sm:p-4',
        'dark:bg-homepage-cardBgDark',
        className
      )}
    >
      {/* Off-screen pass: every block rendered once at the real sheet width so
          the packer works from measured heights, not guesses. */}
      <div aria-hidden="true" className="pointer-events-none invisible absolute inset-x-3 top-0 sm:inset-x-4">
        <SheetChrome meta={meta} sheetRef={measureRef}>
          {blocks.map((block) => (
            <section key={block.id}>
              <BlockTitle measureKey={`title:${block.id}`}>{block.title}</BlockTitle>
              {block.kind === 'section' && (
                <dl className="space-y-1.5">
                  {block.items.map((item, index) => (
                    <DetailRow
                      key={item.key}
                      row={item.row}
                      measureKey={`item:${block.id}:${index}`}
                    />
                  ))}
                </dl>
              )}
              {block.kind === 'declarations' && (
                <ul className="space-y-1.5">
                  {block.items.map((item, index) => (
                    <DeclarationLine
                      key={item.key}
                      line={item.line}
                      measureKey={`item:${block.id}:${index}`}
                    />
                  ))}
                </ul>
              )}
              {(block.kind === 'signature' || block.kind === 'selfie') && (
                <MediaItem
                  kind={block.kind}
                  src={block.kind === 'signature' ? signature : selfie}
                  measureKey={`item:${block.id}:0`}
                />
              )}
            </section>
          ))}
        </SheetChrome>
      </div>

      <div className="space-y-4">
        {(pages ?? []).map((page, index) => (
          <SheetChrome
            key={page.blocks.map((block) => `${block.id}${block.continued ? '-c' : ''}`).join('-')}
            meta={meta}
            page={index + 1}
            total={pages.length}
          >
            {page.blocks.map((block) => (
              <Block
                key={`${block.id}${block.continued ? '-c' : ''}`}
                block={block}
                signature={signature}
                selfie={selfie}
              />
            ))}
          </SheetChrome>
        ))}
      </div>
    </div>
  );
}
