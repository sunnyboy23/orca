import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { FileText, Folder, Globe, Trash2 } from 'lucide-react'
import type {
  DiagnosticsBundlePayload,
  DiagnosticsStatusPayload
} from '../../../../preload/api-types'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'
import {
  getDiagnosticBundleDescription,
  PrivacyDiagnosticBundleControls
} from './PrivacyDiagnosticBundleControls'
import { privacyEn } from '@/i18n/settings-core-panes-en'
import type { PrivacyMessages } from '@/i18n/settings-core-panes-types'

export function PrivacyDiagnosticsSection({
  copy = privacyEn
}: {
  readonly copy?: PrivacyMessages
}): React.JSX.Element {
  const [status, setStatus] = useState<DiagnosticsStatusPayload | null>(null)
  const [bundle, setBundle] = useState<DiagnosticsBundlePayload | null>(null)
  const [previewOpened, setPreviewOpened] = useState(false)
  const [ticketId, setTicketId] = useState<string | null>(null)
  const [collecting, setCollecting] = useState(false)
  const [openingPreview, setOpeningPreview] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [discarding, setDiscarding] = useState(false)
  const [copyingTicket, setCopyingTicket] = useState(false)
  const [deletingTicket, setDeletingTicket] = useState(false)
  const mountedRef = useRef(true)
  const activeBundleSubmissionIdRef = useRef<string | null>(null)

  const refreshStatus = useCallback(async (): Promise<void> => {
    try {
      const next = await window.api.diagnostics.getStatus()
      if (mountedRef.current) {
        setStatus(next)
      }
    } catch {
      /* swallow — pane shows N/A while the IPC is unavailable */
    }
  }, [])

  useEffect(() => {
    void refreshStatus()
  }, [refreshStatus])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (activeBundleSubmissionIdRef.current) {
        void window.api.diagnostics.discardBundlePreview(activeBundleSubmissionIdRef.current)
      }
    }
  }, [])

  useEffect(() => {
    activeBundleSubmissionIdRef.current = bundle?.bundleSubmissionId ?? null
  }, [bundle])

  const handleOpenFolder = useCallback(async (): Promise<void> => {
    try {
      await window.api.diagnostics.openTraceFolder()
    } catch {
      toast.error(copy.diagnostics.toasts.openTraceFolderFailed)
    }
  }, [copy.diagnostics.toasts.openTraceFolderFailed])

  const handleClear = useCallback(async (): Promise<void> => {
    try {
      await window.api.diagnostics.clearTraces()
      if (!mountedRef.current) {
        return
      }
      activeBundleSubmissionIdRef.current = null
      setBundle(null)
      setPreviewOpened(false)
      setTicketId(null)
      await refreshStatus()
      toast.success(copy.diagnostics.toasts.localTracesCleared)
    } catch {
      if (mountedRef.current) {
        toast.error(copy.diagnostics.toasts.clearTraceFilesFailed)
      }
    }
  }, [
    copy.diagnostics.toasts.clearTraceFilesFailed,
    copy.diagnostics.toasts.localTracesCleared,
    refreshStatus
  ])

  const handleCollectBundle = useCallback(async (): Promise<void> => {
    setCollecting(true)
    try {
      const nextBundle = await window.api.diagnostics.collectBundle()
      if (!mountedRef.current) {
        await window.api.diagnostics.discardBundlePreview(nextBundle.bundleSubmissionId)
        return
      }
      setBundle(nextBundle)
      setPreviewOpened(false)
      setTicketId(null)
      toast.success(copy.diagnostics.toasts.previewCreated)
    } catch (error) {
      if (mountedRef.current) {
        toast.error(getDiagnosticsErrorMessage(error, copy.diagnostics.toasts.previewCreateFailed))
      }
    } finally {
      if (mountedRef.current) {
        setCollecting(false)
      }
    }
  }, [copy.diagnostics.toasts.previewCreateFailed, copy.diagnostics.toasts.previewCreated])

  const handleOpenPreview = useCallback(async (): Promise<void> => {
    if (!bundle) {
      return
    }
    setOpeningPreview(true)
    try {
      await window.api.diagnostics.openBundlePreview(bundle.bundleSubmissionId)
      if (!mountedRef.current) {
        return
      }
      setPreviewOpened(true)
      toast.success(copy.diagnostics.toasts.previewOpened)
    } catch (error) {
      if (mountedRef.current) {
        toast.error(getDiagnosticsErrorMessage(error, copy.diagnostics.toasts.previewOpenFailed))
      }
    } finally {
      if (mountedRef.current) {
        setOpeningPreview(false)
      }
    }
  }, [bundle, copy.diagnostics.toasts.previewOpenFailed, copy.diagnostics.toasts.previewOpened])

  const handleUploadBundle = useCallback(async (): Promise<void> => {
    if (!bundle) {
      return
    }
    setUploading(true)
    try {
      const upload = await window.api.diagnostics.uploadBundle(bundle.bundleSubmissionId)
      if (!mountedRef.current) {
        return
      }
      activeBundleSubmissionIdRef.current = null
      setBundle(null)
      setPreviewOpened(false)
      setTicketId(upload.ticketId)
      toast.success(copy.diagnostics.toasts.bundleUploaded)
    } catch (error) {
      if (mountedRef.current) {
        toast.error(getDiagnosticsErrorMessage(error, copy.diagnostics.toasts.bundleUploadFailed))
      }
    } finally {
      if (mountedRef.current) {
        setUploading(false)
      }
    }
  }, [bundle, copy.diagnostics.toasts.bundleUploadFailed, copy.diagnostics.toasts.bundleUploaded])

  const handleDiscardBundle = useCallback(async (): Promise<void> => {
    if (!bundle) {
      return
    }
    setDiscarding(true)
    try {
      await window.api.diagnostics.discardBundlePreview(bundle.bundleSubmissionId)
      if (!mountedRef.current) {
        return
      }
      activeBundleSubmissionIdRef.current = null
      setBundle(null)
      setPreviewOpened(false)
      toast.success(copy.diagnostics.toasts.previewDiscarded)
    } catch (error) {
      if (mountedRef.current) {
        toast.error(getDiagnosticsErrorMessage(error, copy.diagnostics.toasts.previewDiscardFailed))
      }
    } finally {
      if (mountedRef.current) {
        setDiscarding(false)
      }
    }
  }, [bundle, copy.diagnostics.toasts.previewDiscardFailed, copy.diagnostics.toasts.previewDiscarded])

  const handleCopyTicket = useCallback(async (): Promise<void> => {
    if (!ticketId) {
      return
    }
    setCopyingTicket(true)
    try {
      await window.api.ui.writeClipboardText(ticketId)
      if (!mountedRef.current) {
        return
      }
      toast.success(copy.diagnostics.toasts.ticketCopied)
    } catch {
      if (mountedRef.current) {
        toast.error(copy.diagnostics.toasts.ticketCopyFailed)
      }
    } finally {
      if (mountedRef.current) {
        setCopyingTicket(false)
      }
    }
  }, [copy.diagnostics.toasts.ticketCopied, copy.diagnostics.toasts.ticketCopyFailed, ticketId])

  const handleDeleteUploadedBundle = useCallback(async (): Promise<void> => {
    if (!ticketId) {
      return
    }
    setDeletingTicket(true)
    try {
      await window.api.diagnostics.deleteBundle(ticketId)
      if (!mountedRef.current) {
        return
      }
      setTicketId(null)
      toast.success(copy.diagnostics.toasts.uploadedBundleDeleted)
    } catch (error) {
      if (mountedRef.current) {
        toast.error(getDiagnosticsErrorMessage(error, copy.diagnostics.toasts.bundleDeleteFailed))
      }
    } finally {
      if (mountedRef.current) {
        setDeletingTicket(false)
      }
    }
  }, [
    copy.diagnostics.toasts.bundleDeleteFailed,
    copy.diagnostics.toasts.uploadedBundleDeleted,
    ticketId
  ])

  return (
    <>
      {status?.disabledReason ? (
        <DiagnosticsDisabledStateNote reason={status.disabledReason} copy={copy} />
      ) : null}
      <Separator />
      <Section
        icon={<FileText className="size-4" />}
        title={copy.diagnostics.bundle.title}
        description={getDiagnosticBundleDescription({ bundle, previewOpened, ticketId, copy })}
      >
        <PrivacyDiagnosticBundleControls
          status={status}
          bundle={bundle}
          previewOpened={previewOpened}
          ticketId={ticketId}
          collecting={collecting}
          openingPreview={openingPreview}
          uploading={uploading}
          discarding={discarding}
          copyingTicket={copyingTicket}
          deletingTicket={deletingTicket}
          onCollect={handleCollectBundle}
          onOpenPreview={handleOpenPreview}
          onUpload={handleUploadBundle}
          onDiscard={handleDiscardBundle}
          onCopyTicket={handleCopyTicket}
          onDeleteUploadedBundle={handleDeleteUploadedBundle}
          onDismissTicket={() => setTicketId(null)}
          copy={copy}
        />
      </Section>
      <Separator />
      <Section
        icon={<Folder className="size-4" />}
        title={copy.diagnostics.traceFolder.title}
        description={copy.diagnostics.traceFolder.description(
          status?.traceFilePath || copy.diagnostics.traceFolder.fallbackPath
        )}
      >
        <Button variant="outline" size="sm" onClick={() => void handleOpenFolder()}>
          {copy.diagnostics.traceFolder.action}
        </Button>
      </Section>
      <Separator />
      <Section
        icon={<Trash2 className="size-4" />}
        title={copy.diagnostics.clearTraces.title}
        description={copy.diagnostics.clearTraces.description}
      >
        <Button
          variant="outline"
          size="sm"
          disabled={!status?.localFileEnabled}
          onClick={() => void handleClear()}
        >
          {copy.diagnostics.clearTraces.action}
        </Button>
      </Section>
      <Separator />
      <Section
        icon={<Globe className="size-4" />}
        title={copy.diagnostics.otlp.title}
        description={
          status?.otlpStatus ??
          copy.diagnostics.otlp.description
        }
      >
        <span
          className={
            status?.otlpEnabled
              ? 'text-xs font-medium text-foreground'
              : 'text-xs text-muted-foreground'
          }
        >
          {status?.otlpEnabled ? copy.diagnostics.otlp.enabled : copy.diagnostics.otlp.disabled}
        </span>
      </Section>
    </>
  )
}

function getDiagnosticsErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

function DiagnosticsDisabledStateNote({
  reason,
  copy
}: {
  reason: NonNullable<DiagnosticsStatusPayload['disabledReason']>
  copy: PrivacyMessages
}): React.JSX.Element {
  const message =
    reason === 'do_not_track'
      ? copy.diagnostics.disabledNote.doNotTrack
      : reason === 'orca_telemetry_disabled'
        ? copy.diagnostics.disabledNote.telemetryDisabled
        : reason === 'orca_diagnostics_disabled'
          ? copy.diagnostics.disabledNote.diagnosticsDisabled
          : reason === 'ci'
            ? copy.diagnostics.disabledNote.ci
            : copy.diagnostics.disabledNote.fallback

  return (
    <div className="rounded border border-dashed border-border/60 bg-card/30 px-3 py-2 text-xs text-muted-foreground">
      {message}
    </div>
  )
}

function Section({
  icon,
  title,
  description,
  children
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex min-w-0 flex-1 items-start gap-2.5">
        <div className="mt-0.5 text-muted-foreground">{icon}</div>
        <div className="min-w-0 space-y-0.5">
          <Label className="text-sm">{title}</Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{children}</div>
    </div>
  )
}
