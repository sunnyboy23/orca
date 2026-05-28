import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useI18n } from '@/i18n'

type UnsavedChangesDialogProps = {
  open: boolean
  filename: string | null
  onOpenChange: (open: boolean) => void
  onCancel: () => void
  onDiscard: () => void
  onSave: () => void
}

export function UnsavedChangesDialog({
  open,
  filename,
  onOpenChange,
  onCancel,
  onDiscard,
  onSave
}: UnsavedChangesDialogProps): React.JSX.Element {
  const { messages } = useI18n()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">{messages.terminal.unsavedChangesTitle}</DialogTitle>
          <DialogDescription className="text-xs">
            {filename
              ? messages.terminal.unsavedFileChanges(filename)
              : messages.terminal.unsavedGenericChanges}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            {messages.terminal.cancel}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onDiscard}>
            {messages.terminal.dontSave}
          </Button>
          <Button type="button" size="sm" onClick={onSave}>
            {messages.terminal.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
