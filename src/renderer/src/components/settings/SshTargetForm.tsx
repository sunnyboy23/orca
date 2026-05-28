import { FileKey } from 'lucide-react'
import {
  DEFAULT_SSH_RELAY_GRACE_PERIOD_SECONDS,
  MAX_SSH_RELAY_GRACE_PERIOD_SECONDS,
  MIN_SSH_RELAY_GRACE_PERIOD_SECONDS
} from '../../../../shared/ssh-types'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { sshEn } from '@/i18n/settings-ssh-en'
import type { SshSettingsMessages } from '@/i18n/settings-ssh-types'

export type EditingTarget = {
  label: string
  configHost: string
  host: string
  port: string
  username: string
  identityFile: string
  proxyCommand: string
  jumpHost: string
  relayGracePeriodSeconds: string
  relayKeepAliveUntilReset: boolean
}

export const EMPTY_FORM: EditingTarget = {
  label: '',
  configHost: '',
  host: '',
  port: '22',
  username: '',
  identityFile: '',
  proxyCommand: '',
  jumpHost: '',
  relayGracePeriodSeconds: String(DEFAULT_SSH_RELAY_GRACE_PERIOD_SECONDS),
  relayKeepAliveUntilReset: false
}

type SshTargetFormProps = {
  editingId: string | null
  form: EditingTarget
  onFormChange: (updater: (prev: EditingTarget) => EditingTarget) => void
  onSave: () => void
  onCancel: () => void
  copy?: SshSettingsMessages
}

export function SshTargetForm({
  editingId,
  form,
  onFormChange,
  onSave,
  onCancel,
  copy = sshEn
}: SshTargetFormProps): React.JSX.Element {
  return (
    <form
      className="space-y-4 rounded-lg border border-border/50 bg-card/40 p-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSave()
      }}
    >
      <p className="text-sm font-medium">{editingId ? copy.form.editTitle : copy.form.newTitle}</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>{copy.form.label}</Label>
          <Input
            value={form.label}
            onChange={(e) => onFormChange((f) => ({ ...f, label: e.target.value }))}
            placeholder={copy.form.placeholders.label}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{copy.form.host}</Label>
          <Input
            value={form.host}
            onChange={(e) => onFormChange((f) => ({ ...f, host: e.target.value }))}
            placeholder={copy.form.placeholders.host}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{copy.form.username}</Label>
          <Input
            value={form.username}
            onChange={(e) => onFormChange((f) => ({ ...f, username: e.target.value }))}
            placeholder={copy.form.placeholders.username}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{copy.form.port}</Label>
          <Input
            type="number"
            value={form.port}
            onChange={(e) => onFormChange((f) => ({ ...f, port: e.target.value }))}
            placeholder={copy.form.placeholders.port}
            min={1}
            max={65535}
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label className="flex items-center gap-1.5">
            <FileKey className="size-3.5" />
            {copy.form.identityFile}
          </Label>
          <Input
            value={form.identityFile}
            onChange={(e) => onFormChange((f) => ({ ...f, identityFile: e.target.value }))}
            placeholder={copy.form.placeholders.identityFile}
          />
          <p className="text-[11px] text-muted-foreground">
            {copy.form.help.identityFile}
          </p>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>{copy.form.proxyCommand}</Label>
          <Input
            value={form.proxyCommand}
            onChange={(e) => onFormChange((f) => ({ ...f, proxyCommand: e.target.value }))}
            placeholder={copy.form.placeholders.proxyCommand}
          />
          <p className="text-[11px] text-muted-foreground">
            {copy.form.help.proxyCommand}
          </p>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>{copy.form.jumpHost}</Label>
          <Input
            value={form.jumpHost}
            onChange={(e) => onFormChange((f) => ({ ...f, jumpHost: e.target.value }))}
            placeholder={copy.form.placeholders.jumpHost}
          />
          <p className="text-[11px] text-muted-foreground">
            {copy.form.help.jumpHost}
          </p>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>{copy.form.relayGracePeriod}</Label>
          <Input
            type={form.relayKeepAliveUntilReset ? 'text' : 'number'}
            value={
              form.relayKeepAliveUntilReset
                ? copy.form.placeholders.untilReset
                : form.relayGracePeriodSeconds
            }
            onChange={(e) =>
              onFormChange((f) => ({ ...f, relayGracePeriodSeconds: e.target.value }))
            }
            placeholder={String(DEFAULT_SSH_RELAY_GRACE_PERIOD_SECONDS)}
            min={MIN_SSH_RELAY_GRACE_PERIOD_SECONDS}
            max={MAX_SSH_RELAY_GRACE_PERIOD_SECONDS}
            disabled={form.relayKeepAliveUntilReset}
          />
          <label className="flex cursor-pointer items-start gap-2.5 py-1 text-xs">
            <input
              type="checkbox"
              className="mt-0.5 size-3.5 shrink-0 accent-foreground"
              checked={form.relayKeepAliveUntilReset}
              onChange={(e) =>
                onFormChange((f) => ({ ...f, relayKeepAliveUntilReset: e.target.checked }))
              }
            />
            <span className="space-y-0.5">
              <span className="block font-medium text-foreground">
                {copy.form.keepAliveUntilReset}
              </span>
              <span className="block text-muted-foreground">{copy.form.keepAliveDescription}</span>
            </span>
          </label>
          <p className="text-[11px] text-muted-foreground">
            {copy.form.relayHelp(MAX_SSH_RELAY_GRACE_PERIOD_SECONDS)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm">
          {editingId ? copy.form.saveChanges : copy.form.addTarget}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          {copy.form.cancel}
        </Button>
      </div>
    </form>
  )
}
