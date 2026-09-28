"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";
import { ui } from "@/lib/copy";

/**
 * pdf.js, fetched the first time a PDF is opened in the full-screen viewer.
 * The library and its worker are about 1.7MB together, so the import sits
 * behind this function rather than at module scope: a visitor who never
 * opens a PDF never pays for it, and the gallery grid keeps using the
 * first-page PNG the Studio saved (see lib/media.ts).
 */
let pdfjs: Promise<typeof import("pdfjs-dist")> | null = null;
function loadPdfjs() {
  if (!pdfjs) {
    pdfjs = import("pdfjs-dist").then((lib) => {
      // `new URL(..., import.meta.url)` is the form the bundler rewrites to
      // the emitted worker asset, so this resolves in dev and on Vercel alike.
      lib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
      return lib;
    });
    // A failed fetch shouldn't poison every later attempt.
    pdfjs.catch(() => { pdfjs = null; });
  }
  return pdfjs;
}

/** Cap the backing store at 2x: past that a page costs memory without looking sharper. */
const MAX_DPR = 2;
/** The widest a page is drawn, whatever the viewer's width — keeps a canvas from going vast on a big monitor. */
const MAX_PAGE_WIDTH = 1400;

/**
 * One page of the document. It holds its slot in the scroll column from the
 * start (sized by `ratio`, so the scrollbar is honest before anything is
 * drawn) and only rasterises once it comes near the viewport.
 */
function PdfPage({
  doc,
  number,
  ratio,
  width,
  onVisible
}: {
  doc: PDFDocumentProxy;
  number: number;
  ratio: number;
  width: number;
  onVisible: (page: number) => void;
}) {
  const slotRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [near, setNear] = useState(number === 1);
  const [drawn, setDrawn] = useState(false);

  // Two jobs, one observer each: draw the page before it is reached, and tell
  // the caption which page is being read. The margins differ, so they can't share.
  useEffect(() => {
    const node = slotRef.current;
    if (!node) return;
    const ahead = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setNear(true); },
      { root: node.closest(".pj-lb-pdf"), rootMargin: "200% 0px" }
    );
    const current = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onVisible(number); },
      { root: node.closest(".pj-lb-pdf"), threshold: 0.5 }
    );
    ahead.observe(node);
    current.observe(node);
    return () => { ahead.disconnect(); current.disconnect(); };
  }, [number, onVisible]);

  useEffect(() => {
    if (!near || width <= 0) return;
    let cancelled = false;
    let task: { cancel: () => void } | null = null;

    (async () => {
      const page = await doc.getPage(number);
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const base = page.getViewport({ scale: 1 });
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const viewport = page.getViewport({ scale: (width / base.width) * dpr });
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      // "print" draws in a single pass. The on-screen intent waits on animation
      // frames, which never arrive while the tab is backgrounded.
      const render = page.render({ canvas, viewport, background: "#ffffff", intent: "print" });
      task = render;
      try {
        await render.promise;
        if (!cancelled) setDrawn(true);
      } catch {
        // A cancelled render throws; nothing to report.
      }
    })();

    return () => { cancelled = true; task?.cancel(); };
  }, [doc, number, near, width]);

  return (
    <div
      ref={slotRef}
      className="pj-lb-page"
      style={{ aspectRatio: ratio, width: width > 0 ? width : undefined }}
      data-page={number}
    >
      <canvas ref={canvasRef} className={drawn ? "is-drawn" : undefined} aria-hidden={!drawn} />
    </div>
  );
}

/**
 * A PDF in the full-screen viewer: every page, stacked in one scrollable
 * column, drawn from the file itself rather than from the Studio's
 * first-page preview. The grid behind the viewer still shows only page one.
 */
export function PdfPages({
  src,
  alt,
  onPageChange
}: {
  src: string;
  alt: string;
  onPageChange: (page: number, total: number) => void;
}) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [ratio, setRatio] = useState(1 / Math.SQRT2); // A4 portrait, until page one says otherwise.
  const [width, setWidth] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");

  // Measure the column so pages are rasterised at the size they are shown.
  useEffect(() => {
    const node = columnRef.current;
    if (!node) return;
    const measure = () => setWidth(Math.min(node.clientWidth, MAX_PAGE_WIDTH));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Destroying the loading task frees the worker and the parsed document.
    let task: PDFDocumentLoadingTask | null = null;
    setStatus("loading");
    setDoc(null);

    (async () => {
      try {
        const lib = await loadPdfjs();
        if (cancelled) return;
        task = lib.getDocument({ url: src });
        const loaded = await task.promise;
        if (cancelled) return;
        // Page one sets the slot shape for the whole document; a page that
        // differs corrects itself once it is drawn.
        const first = await loaded.getPage(1);
        const view = first.getViewport({ scale: 1 });
        if (cancelled) return;
        setRatio(view.width / view.height);
        setDoc(loaded);
        setStatus("ready");
        onPageChange(1, loaded.numPages);
      } catch {
        if (!cancelled) setStatus("failed");
      }
    })();

    return () => {
      cancelled = true;
      task?.destroy();
    };
  }, [src, onPageChange]);

  const handleVisible = useCallback(
    (page: number) => { if (doc) onPageChange(page, doc.numPages); },
    [doc, onPageChange]
  );

  return (
    <div ref={columnRef} className="pj-lb-pdf" role="document" aria-label={alt} tabIndex={0}>
      {status !== "ready" && (
        <span className="pj-lb-loading" role="status">
          {status === "failed" ? ui.gallery.failed : ui.gallery.loading}
        </span>
      )}
      {doc &&
        Array.from({ length: doc.numPages }, (_, i) => (
          <PdfPage
            key={i + 1}
            doc={doc}
            number={i + 1}
            ratio={ratio}
            width={width}
            onVisible={handleVisible}
          />
        ))}
    </div>
  );
}
