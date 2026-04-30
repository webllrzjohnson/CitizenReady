'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

/** Minimal typing for PDF.js loaded at runtime (see `/public/pdf-viewer/pdf.min.mjs`). */
type PdfViewport = { width: number; height: number }
type PdfRenderTask = { promise: Promise<void>; cancel(): void }
type PdfPageProxy = {
  getViewport: (opts: { scale: number }) => PdfViewport
  render: (opts: { canvasContext: CanvasRenderingContext2D; viewport: PdfViewport }) => PdfRenderTask
}
type PdfDocumentProxy = {
  numPages: number
  getPage: (num: number) => Promise<PdfPageProxy>
}
type PdfJsModule = {
  GlobalWorkerOptions: { workerSrc: string }
  getDocument: (src: string | { url: string }) => { promise: Promise<PdfDocumentProxy> }
}

type Props = { fileUrl: string }

const PAD = 24
const ZOOM_STEP_PCT = 25
const MIN_ZOOM_PCT = 50
const MAX_ZOOM_PCT = 400
const ABS_MAX_SCALE = 6

let pdfJsPromise: Promise<PdfJsModule> | null = null

function loadPdfJs(): Promise<PdfJsModule> {
  if (!pdfJsPromise) {
    pdfJsPromise = (async () => {
      const mod = (await import(
        /* webpackIgnore: true */
        // @ts-expect-error Runtime absolute URL — file lives in `public/pdf-viewer/` (not bundled).
        '/pdf-viewer/pdf.min.mjs'
      )) as PdfJsModule
      mod.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
      return mod
    })()
  }
  return pdfJsPromise
}

export function DiscoverCanadaPdfViewer({ fileUrl }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [container, setContainer] = useState({ w: 0, h: 0 })
  const [pdfDoc, setPdfDoc] = useState<PdfDocumentProxy | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [zoomPercent, setZoomPercent] = useState(100)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setContainer({ w: el.clientWidth, h: el.clientHeight })
    })
    ro.observe(el)
    setContainer({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false
    setPdfDoc(null)
    setNumPages(null)
    setLoadError(false)
    setLoading(true)
    setPageNumber(1)
    setZoomPercent(100)

    ;(async () => {
      try {
        const pdfjs = await loadPdfJs()
        const pdf = await pdfjs.getDocument({ url: fileUrl }).promise
        if (cancelled) return
        setPdfDoc(pdf)
        setNumPages(pdf.numPages)
      } catch {
        if (!cancelled) setLoadError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [fileUrl])

  useEffect(() => {
    const pdf = pdfDoc
    const canvas = canvasRef.current
    if (!pdf || !canvas || container.w < PAD * 2 || container.h < PAD * 2) return

    let renderTask: PdfRenderTask | null = null
    let cancelled = false

    ;(async () => {
      try {
        const page = await pdf.getPage(pageNumber)
        if (cancelled) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const base = page.getViewport({ scale: 1 })
        const maxW = container.w - PAD * 2
        const maxH = container.h - PAD * 2
        const fit = Math.min(Math.max(Math.min(maxW / base.width, maxH / base.height), 0.12), 4)
        const scale = Math.min(fit * (zoomPercent / 100), ABS_MAX_SCALE)
        const viewport = page.getViewport({ scale })

        const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)
        canvas.width = Math.floor(viewport.width * dpr)
        canvas.height = Math.floor(viewport.height * dpr)
        canvas.style.width = `${Math.floor(viewport.width)}px`
        canvas.style.height = `${Math.floor(viewport.height)}px`
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.scale(dpr, dpr)

        renderTask = page.render({ canvasContext: ctx, viewport })
        await renderTask.promise
      } catch (e) {
        if (
          cancelled ||
          (e instanceof Error && /Rendering cancelled|Transport destroyed/i.test(e.message))
        ) {
          return
        }
        console.error(e)
      }
    })()

    return () => {
      cancelled = true
      renderTask?.cancel()
    }
  }, [pdfDoc, pageNumber, container.w, container.h, zoomPercent])

  const zoomIn = useCallback(() => {
    setZoomPercent((z) => Math.min(MAX_ZOOM_PCT, z + ZOOM_STEP_PCT))
  }, [])

  const zoomOut = useCallback(() => {
    setZoomPercent((z) => Math.max(MIN_ZOOM_PCT, z - ZOOM_STEP_PCT))
  }, [])

  const zoomFit = useCallback(() => {
    setZoomPercent(100)
  }, [])

  const goPrev = useCallback(() => {
    setPageNumber((p) => Math.max(1, p - 1))
  }, [])

  const goNext = useCallback(() => {
    setPageNumber((p) => {
      const max = numPages
      if (max === null) return p
      return Math.min(max, p + 1)
    })
  }, [numPages])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target
      if (t instanceof HTMLElement && (t.closest('[contenteditable="true"]') || t.closest('input, textarea, select')))
        return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        zoomIn()
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        zoomOut()
      }
      if (e.key === '0') {
        e.preventDefault()
        zoomFit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goPrev, goNext, zoomIn, zoomOut, zoomFit])

  const atEnd = numPages !== null && pageNumber >= numPages
  const atStart = pageNumber <= 1
  const navDisabled = numPages === null || loading
  const zoomOutDisabled = navDisabled || zoomPercent <= MIN_ZOOM_PCT
  const zoomInDisabled = navDisabled || zoomPercent >= MAX_ZOOM_PCT
  const atFitZoom = zoomPercent === 100

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={goPrev}
            disabled={navDisabled || atStart}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={goNext}
            disabled={navDisabled || atEnd}
            aria-label="Next page"
          >
            Next
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
        <div className="text-center sm:text-right">
          <p className="text-sm tabular-nums text-muted-foreground" aria-live="polite">
            Page <span className="font-medium text-foreground">{pageNumber}</span>
            {numPages !== null ? (
              <>
                {' '}
                of <span className="font-medium text-foreground">{numPages}</span>
              </>
            ) : (
              ' …'
            )}
          </p>
          <p className="text-xs text-muted-foreground">← → pages · + − zoom · 0 fit page</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 border-y border-border/60 py-3 sm:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={zoomOut}
            disabled={zoomOutDisabled}
            aria-label="Zoom out"
          >
            <ZoomOut className="size-4" aria-hidden />
            Zoom out
          </Button>
          <span className="min-w-[4.5rem] text-center text-sm tabular-nums text-muted-foreground" aria-live="polite">
            {zoomPercent}%
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={zoomIn}
            disabled={zoomInDisabled}
            aria-label="Zoom in"
          >
            <ZoomIn className="size-4" aria-hidden />
            Zoom in
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={zoomFit} disabled={navDisabled || atFitZoom}>
            Fit page
          </Button>
        </div>
        <p className="max-w-xs text-center text-xs text-muted-foreground sm:text-left">
          Percent is on top of “fit to viewer” — scroll when the page is larger than the box.
        </p>
      </div>

      <div
        ref={wrapRef}
        className="relative w-full overflow-auto rounded-xl border border-border bg-[hsl(220_14%_96%)] dark:bg-muted/50"
        style={{ height: 'min(85dvh, 880px)' }}
      >
        <div className="flex min-h-full w-full items-start justify-center p-3 sm:p-4">
          {loadError ? (
            <p className="max-w-md p-8 text-center text-sm text-destructive">
              Could not load the PDF. Try opening it in a new tab from the links above.
            </p>
          ) : loading ? (
            <div className="flex w-full max-w-3xl flex-col gap-3 py-12">
              <Skeleton className="mx-auto aspect-[3/4] w-full max-w-2xl rounded-lg" />
              <p className="text-center text-sm text-muted-foreground">Loading handbook…</p>
            </div>
          ) : (
            <div className="shrink-0">
              <canvas ref={canvasRef} className="block shadow-md" aria-label={`PDF page ${pageNumber}`} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
