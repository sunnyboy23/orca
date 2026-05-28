import { Check, Clipboard, Eye, FileText, Loader2, Trash2, UploadCloud, X } from 'lucide-react'
import type {
  DiagnosticsBundlePayload,
  DiagnosticsStatusPayload
} from '../../../../preload/api-types'
import { Button } from '../ui/button'
import { privacyEn } from '@/i18n/settings-core-panes-en'
import type { PrivacyMessages } from '@/i18n/settings-core-panes-types'

export function PrivacyDiagnosticBundleControls({
  status,
  bundle,
  previewOpened,
  ticketId,
  collecting,
  openingPreview,
  uploading,
  discarding,
  copyingTicket,
  deletingTicket,
  onCollect,
  onOpenPreview,
  onUpload,
  onDiscard,
  onCopyTicket,
  onDeleteUploadedBundle,
  onDismissTicket,
  copy = privacyEn
}: {
  readonly status: DiagnosticsStatusPayload | null
  readonly bundle: DiagnosticsBundlePayload | null
  readonly previewOpened: boolean
  readonly ticketId: string | null
  readonly collecting: boolean
  readonly openingPreview: boolean
  readonly uploading: boolean
  readonly discarding: boolean
  readonly copyingTicket: boolean
  readonly deletingTicket: boolean
  readonly onCollect: () => Promise<void>
  readonly onOpenPreview: () => Promise<void>
  readonly onUpload: () => Promise<void>
  readonly onDiscard: () => Promise<void>
  readonly onCopyTicket: () => Promise<void>
  readonly onDeleteUploadedBundle: () => Promise<void>
  readonly onDismissTicket: () => void
  readonly copy?: PrivacyMessages
}): React.JSX.Element {
  if (ticketId) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          disabled={copyingTicket}
          onClick={() => void onCopyTicket()}
        >
          <ActionIcon busy={copyingTicket} icon={<Clipboard className="size-3.5" />} />
          {copy.diagnostics.bundle.copyTicket}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          disabled={deletingTicket}
          onClick={() => void onDeleteUploadedBundle()}
        >
          <ActionIcon busy={deletingTicket} icon={<Trash2 className="size-3.5" />} />
          {copy.diagnostics.bundle.deleteBundle}
        </Button>
        <Button variant="ghost" size="sm" disabled={deletingTicket} onClick={onDismissTicket}>
          <Check className="size-3.5" />
          {copy.diagnostics.bundle.done}
        </Button>
      </>
    )
  }

  if (bundle) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          disabled={openingPreview}
          onClick={() => void onOpenPreview()}
        >
          <ActionIcon busy={openingPreview} icon={<Eye className="size-3.5" />} />
          {copy.diagnostics.bundle.openPreview}
        </Button>
        <Button size="sm" disabled={!previewOpened || uploading} onClick={() => void onUpload()}>
          <ActionIcon busy={uploading} icon={<UploadCloud className="size-3.5" />} />
          {copy.diagnostics.bundle.upload}
        </Button>
        <Button variant="ghost" size="sm" disabled={discarding} onClick={() => void onDiscard()}>
          <ActionIcon busy={discarding} icon={<X className="size-3.5" />} />
          {copy.diagnostics.bundle.discard}
        </Button>
      </>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={!status?.bundleEnabled || collecting}
      onClick={() => void onCollect()}
    >
      <ActionIcon busy={collecting} icon={<FileText className="size-3.5" />} />
      {copy.diagnostics.bundle.createPreview}
    </Button>
  )
}

export function getDiagnosticBundleDescription({
  bundle,
  previewOpened,
  ticketId,
  copy = privacyEn
}: {
  readonly bundle: DiagnosticsBundlePayload | null
  readonly previewOpened: boolean
  readonly ticketId: string | null
  readonly copy?: PrivacyMessages
}): string {
  if (ticketId) {
    return copy.diagnostics.bundle.uploadedTicket(ticketId)
  }
  if (bundle) {
    const previewState = previewOpened
      ? copy.diagnostics.bundle.readyToUpload
      : copy.diagnostics.bundle.openPreviewBeforeUpload
    return copy.diagnostics.bundle.spanSummary(bundle.spanCount, formatBytes(bundle.bytes), previewState)
  }
  return copy.diagnostics.bundle.redactedPreview
}

function ActionIcon({ busy, icon }: { readonly busy: boolean; readonly icon: React.ReactNode }) {
  return busy ? <Loader2 className="size-3.5 animate-spin" /> : icon
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
