import type { SettingFieldCopy } from './settings-types'

export type InputMessages = {
  middleClickPaste: SettingFieldCopy
}

export type TasksMessages = {
  header: {
    title: string
    description: string
  }
  providersSearch: SettingFieldCopy
  providerDescriptions: {
    github: string
    gitlab: string
    linear: string
  }
}

export type ExperimentalMessages = {
  pet: SettingFieldCopy
  agentsView: SettingFieldCopy
  symlinks: SettingFieldCopy
  missingSearchEntry: (title: string) => string
}

export type PrivacyMessages = {
  telemetry: SettingFieldCopy & {
    policyLink: string
    ariaLabel: string
  }
  blocked: {
    ci: string
    env: (envName: string) => string
  }
  diagnostics: {
    search: {
      pane: SettingFieldCopy
      bundle: SettingFieldCopy
      environment: SettingFieldCopy
    }
    toasts: {
      openTraceFolderFailed: string
      localTracesCleared: string
      clearTraceFilesFailed: string
      previewCreated: string
      previewCreateFailed: string
      previewOpened: string
      previewOpenFailed: string
      bundleUploaded: string
      bundleUploadFailed: string
      previewDiscarded: string
      previewDiscardFailed: string
      ticketCopied: string
      ticketCopyFailed: string
      uploadedBundleDeleted: string
      bundleDeleteFailed: string
    }
    bundle: {
      title: string
      uploadedTicket: (ticketId: string) => string
      readyToUpload: string
      openPreviewBeforeUpload: string
      spanSummary: (spanCount: number, bytes: string, previewState: string) => string
      redactedPreview: string
      copyTicket: string
      deleteBundle: string
      done: string
      openPreview: string
      upload: string
      discard: string
      createPreview: string
    }
    traceFolder: {
      title: string
      fallbackPath: string
      description: (path: string) => string
      action: string
    }
    clearTraces: {
      title: string
      description: string
      action: string
    }
    otlp: {
      title: string
      description: string
      enabled: string
      disabled: string
    }
    disabledNote: {
      doNotTrack: string
      telemetryDisabled: string
      diagnosticsDisabled: string
      ci: string
      fallback: string
    }
  }
}
