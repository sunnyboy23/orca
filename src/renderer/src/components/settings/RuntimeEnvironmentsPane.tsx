/* eslint-disable max-lines -- Why: the server settings pane keeps active
   server selection, saved server mutation, and confirmation dialogs together so
   the state transitions stay auditable. */
import { Loader2, Plus, RefreshCw, Share2, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { GlobalSettings } from '../../../../shared/types'
import type { PublicKnownRuntimeEnvironment } from '../../../../shared/runtime-environments'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { SearchableSetting } from './SearchableSetting'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'
import { RuntimePairingUrlGenerator } from './RuntimePairingUrlGenerator'
import {
  getRuntimeEnvironmentsSearchEntry,
  getWebRuntimeEnvironmentsSearchEntry
} from './runtime-environments-search'
import { useI18n } from '@/i18n'

const LOCAL_RUNTIME_VALUE = '__local__'
const NO_RUNTIME_VALUE = '__none__'

type RuntimeEnvironmentsPaneProps = {
  settings: GlobalSettings
  switchRuntimeEnvironment: (environmentId: string | null) => Promise<boolean>
  canGeneratePairingUrl?: boolean
  allowLocalRuntime?: boolean
}

export function RuntimeEnvironmentsPane({
  settings,
  switchRuntimeEnvironment,
  canGeneratePairingUrl = true,
  allowLocalRuntime = true
}: RuntimeEnvironmentsPaneProps): React.JSX.Element {
  const { messages } = useI18n()
  const copy = messages.settingsPanes.runtime
  const [environments, setEnvironments] = useState<PublicKnownRuntimeEnvironment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [switchingValue, setSwitchingValue] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [pendingSwitchValue, setPendingSwitchValue] = useState<string | null>(null)
  const [pendingRemove, setPendingRemove] = useState<PublicKnownRuntimeEnvironment | null>(null)
  const [addServerFormOpen, setAddServerFormOpen] = useState(false)
  const [shareServerFormOpen, setShareServerFormOpen] = useState(false)
  const [switchError, setSwitchError] = useState<string | null>(null)
  const [removeError, setRemoveError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [pairingCode, setPairingCode] = useState('')
  const activeValue =
    settings.activeRuntimeEnvironmentId ??
    (allowLocalRuntime ? LOCAL_RUNTIME_VALUE : NO_RUNTIME_VALUE)
  const isBusy = isSaving || switchingValue !== null || removingId !== null
  const removingActiveServer = pendingRemove?.id === settings.activeRuntimeEnvironmentId
  const searchEntry = canGeneratePairingUrl
    ? getRuntimeEnvironmentsSearchEntry(copy)
    : getWebRuntimeEnvironmentsSearchEntry(copy)

  const loadEnvironments = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    try {
      setEnvironments(await window.api.runtimeEnvironments.list())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : copy.feedback.loadFailed)
    } finally {
      setIsLoading(false)
    }
  }, [copy.feedback.loadFailed])

  useEffect(() => {
    void loadEnvironments()
  }, [loadEnvironments])

  const closeAddServerForm = (): void => {
    if (isSaving) {
      return
    }
    setAddServerFormOpen(false)
    setName('')
    setPairingCode('')
  }

  const addEnvironment = async (): Promise<void> => {
    const trimmedName = name.trim()
    const trimmedPairingCode = pairingCode.trim()
    if (!trimmedName || !trimmedPairingCode) {
      toast.error(copy.feedback.required)
      return
    }
    const duplicate = environments.find(
      (environment) => environment.name.trim().toLowerCase() === trimmedName.toLowerCase()
    )
    if (duplicate) {
      toast.error(copy.feedback.duplicate(duplicate.name))
      return
    }
    setIsSaving(true)
    try {
      if (!allowLocalRuntime && settings.activeRuntimeEnvironmentId) {
        const disconnected = await switchRuntimeEnvironment(null)
        if (!disconnected) {
          return
        }
      }
      const result = await window.api.runtimeEnvironments.addFromPairingCode({
        name: trimmedName,
        pairingCode: trimmedPairingCode
      })
      setName('')
      setPairingCode('')
      await loadEnvironments()
      if (!allowLocalRuntime) {
        const switched = await switchRuntimeEnvironment(result.environment.id)
        if (!switched) {
          await window.api.runtimeEnvironments.remove({ selector: result.environment.id })
          await loadEnvironments()
          return
        }
        toast.success(copy.feedback.connected(result.environment.name))
      } else {
        toast.success(copy.feedback.saved(result.environment.name))
      }
      setAddServerFormOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : copy.feedback.saveFailed)
    } finally {
      setIsSaving(false)
    }
  }

  const removeEnvironment = async (
    environment: PublicKnownRuntimeEnvironment
  ): Promise<boolean> => {
    setRemovingId(environment.id)
    setRemoveError(null)
    try {
      if (settings.activeRuntimeEnvironmentId === environment.id) {
        const switched = await switchRuntimeEnvironment(null)
        if (!switched) {
          setRemoveError(
            allowLocalRuntime
              ? copy.feedback.switchLocalFailed
              : copy.feedback.disconnectFailed
          )
          return false
        }
        if (!allowLocalRuntime) {
          await loadEnvironments()
          toast.success(copy.feedback.removed(environment.name))
          return true
        }
      }
      await window.api.runtimeEnvironments.remove({ selector: environment.id })
      await loadEnvironments()
      toast.success(copy.feedback.removed(environment.name))
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : copy.feedback.removeFailed
      setRemoveError(message)
      toast.error(message)
      return false
    } finally {
      setRemovingId(null)
    }
  }

  const switchToValue = async (value: string): Promise<boolean> => {
    if (value === NO_RUNTIME_VALUE) {
      return false
    }
    setSwitchingValue(value)
    setSwitchError(null)
    try {
      const switched = await switchRuntimeEnvironment(
        allowLocalRuntime && value === LOCAL_RUNTIME_VALUE ? null : value
      )
      if (switched) {
        toast.success(copy.feedback.switched(getEnvironmentLabel(value)))
        return true
      }
      setSwitchError(copy.feedback.switchFailed)
      return false
    } catch (error) {
      const message = error instanceof Error ? error.message : copy.feedback.switchFailed
      setSwitchError(message)
      toast.error(message)
      return false
    } finally {
      setSwitchingValue(null)
    }
  }

  const getEnvironmentLabel = (value: string): string => {
    if (value === LOCAL_RUNTIME_VALUE) {
      return copy.labels.localDesktop
    }
    if (value === NO_RUNTIME_VALUE) {
      return copy.labels.noServerConnected
    }
    return (
      environments.find((environment) => environment.id === value)?.name ?? copy.labels.remoteServer
    )
  }

  return (
    <SearchableSetting
      title={searchEntry.title}
      description={searchEntry.description}
      keywords={searchEntry.keywords}
      className="space-y-4 py-2"
    >
      <div className="space-y-2">
        <div className="space-y-1">
          <Label id="runtime-active-server-label">{copy.labels.activeServer}</Label>
          <p className="text-xs text-muted-foreground">
            {allowLocalRuntime
              ? copy.descriptions.activeServerLocal
              : copy.descriptions.activeServerWeb}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={activeValue}
            onValueChange={(value) => {
              if (value !== activeValue) {
                setSwitchError(null)
                setPendingSwitchValue(value)
              }
            }}
            disabled={isBusy}
          >
            <SelectTrigger
              size="sm"
              className="min-w-[260px]"
              aria-labelledby="runtime-active-server-label"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allowLocalRuntime ? (
                <SelectItem value={LOCAL_RUNTIME_VALUE}>{copy.labels.localDesktop}</SelectItem>
              ) : environments.length === 0 ? (
                <SelectItem value={NO_RUNTIME_VALUE} disabled>
                  {copy.labels.noServerConnected}
                </SelectItem>
              ) : null}
              {environments.map((environment) => (
                <SelectItem key={environment.id} value={environment.id}>
                  {environment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={copy.actions.refresh}
            title={copy.actions.refresh}
            onClick={() => void loadEnvironments()}
            disabled={isLoading || isBusy}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium">{copy.labels.savedServers}</div>
          {addServerFormOpen ? null : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setAddServerFormOpen(true)}
              disabled={isBusy}
            >
              <Plus />
              {copy.actions.addServer}
            </Button>
          )}
        </div>

        {addServerFormOpen ? (
          <form
            className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-3"
            onSubmit={(event) => {
              event.preventDefault()
              void addEnvironment()
            }}
          >
            <div className="grid gap-3 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)]">
              <div className="space-y-1">
                <Label htmlFor="runtime-server-name">{copy.labels.serverName}</Label>
                <Input
                  id="runtime-server-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={copy.placeholders.serverName}
                  className="h-8 text-xs"
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="runtime-server-pairing-code">{copy.labels.pairingCode}</Label>
                <Input
                  id="runtime-server-pairing-code"
                  aria-describedby="runtime-server-pairing-code-help"
                  value={pairingCode}
                  onChange={(event) => setPairingCode(event.target.value)}
                  placeholder={copy.placeholders.pairingCode}
                  className="h-8 min-w-0 font-mono text-xs"
                />
                <p id="runtime-server-pairing-code-help" className="text-xs text-muted-foreground">
                  {copy.descriptions.pairingHelp}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={closeAddServerForm}
                disabled={isSaving}
              >
                {copy.actions.cancel}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isBusy || !name.trim() || !pairingCode.trim()}
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <Plus />}
                {copy.actions.addServer}
              </Button>
            </div>
          </form>
        ) : null}

        <div className="rounded-lg border border-border/50">
          {environments.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground">
              {copy.descriptions.noSavedServers}
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {environments.map((environment) => (
                <div
                  key={environment.id}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{environment.name}</div>
                    <div className="truncate font-mono text-xs text-muted-foreground">
                      {environment.endpoints[0]?.endpoint ?? copy.labels.noEndpoint}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      setRemoveError(null)
                      setPendingRemove(environment)
                    }}
                    disabled={isBusy}
                    aria-label={`${copy.actions.remove} ${environment.name}`}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {canGeneratePairingUrl ? (
        <div className="overflow-hidden rounded-lg border border-border/50">
          <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5">
            <div className="min-w-0 space-y-0.5">
              <div className="text-sm font-medium">{copy.labels.shareServer}</div>
              <p className="text-xs text-muted-foreground">{copy.descriptions.shareServer}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setShareServerFormOpen((open) => !open)}
            >
              <Share2 />
              {shareServerFormOpen ? copy.actions.hideForm : copy.actions.newLink}
            </Button>
          </div>
          <div className="border-t border-border/40 px-3 py-3">
            <RuntimePairingUrlGenerator
              framed={false}
              showHeader={false}
              showGeneratorForm={shareServerFormOpen}
            />
          </div>
        </div>
      ) : null}

      <Dialog
        open={pendingSwitchValue !== null}
        onOpenChange={(open) => {
          if (!open && switchingValue === null) {
            setSwitchError(null)
            setPendingSwitchValue(null)
          }
        }}
      >
        <DialogContent className="max-w-sm sm:max-w-sm" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-sm">{copy.actions.switch}</DialogTitle>
            <DialogDescription>{copy.descriptions.switchServer}</DialogDescription>
          </DialogHeader>
          {pendingSwitchValue ? (
            <div className="rounded-md border border-border/70 bg-muted/35 px-3 py-2 text-xs">
              <div className="text-muted-foreground">{copy.labels.switchTo}</div>
              <div className="mt-0.5 truncate font-medium">
                {getEnvironmentLabel(pendingSwitchValue)}
              </div>
            </div>
          ) : null}
          {switchError ? <p className="text-sm text-destructive">{switchError}</p> : null}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSwitchError(null)
                setPendingSwitchValue(null)
              }}
              disabled={switchingValue !== null}
            >
              {copy.actions.cancel}
            </Button>
            <Button
              onClick={() => {
                const value = pendingSwitchValue
                if (!value) {
                  return
                }
                void switchToValue(value).then((switched) => {
                  if (switched) {
                    setPendingSwitchValue(null)
                  }
                })
              }}
              disabled={switchingValue !== null}
            >
              {switchingValue !== null ? <Loader2 className="animate-spin" /> : null}
              {copy.actions.switch}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={pendingRemove !== null}
        onOpenChange={(open) => {
          if (!open && removingId === null) {
            setRemoveError(null)
            setPendingRemove(null)
          }
        }}
      >
        <DialogContent className="max-w-sm sm:max-w-sm" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-sm">{copy.actions.remove}</DialogTitle>
            <DialogDescription>
              {removingActiveServer
                ? allowLocalRuntime
                  ? copy.descriptions.removeActiveLocal
                  : copy.descriptions.removeActiveWeb
                : copy.descriptions.removeInactive}
            </DialogDescription>
          </DialogHeader>
          {pendingRemove ? (
            <div className="rounded-md border border-border/70 bg-muted/35 px-3 py-2 text-xs">
              <div className="truncate font-medium">{pendingRemove.name}</div>
              <div className="mt-0.5 truncate font-mono text-muted-foreground">
                {pendingRemove.endpoints[0]?.endpoint ?? copy.labels.noEndpoint}
              </div>
            </div>
          ) : null}
          {removeError ? <p className="text-sm text-destructive">{removeError}</p> : null}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRemoveError(null)
                setPendingRemove(null)
              }}
              disabled={removingId !== null}
            >
              {copy.actions.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const environment = pendingRemove
                if (!environment) {
                  return
                }
                void removeEnvironment(environment).then((removed) => {
                  if (removed) {
                    setPendingRemove(null)
                  }
                })
              }}
              disabled={removingId !== null}
            >
              {removingId !== null ? <Loader2 className="animate-spin" /> : <Trash2 />}
              {copy.actions.remove}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SearchableSetting>
  )
}
