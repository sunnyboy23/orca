import { useI18n } from '@/i18n'

export function EditorLoadingFallback(): React.JSX.Element {
  const { messages } = useI18n()
  return (
    <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
      {messages.terminal.loadingEditor}
    </div>
  )
}
