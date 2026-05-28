import type { Bot } from 'lucide-react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

export function FeishuSetupField({
  icon: Icon,
  label,
  value,
  placeholder,
  type = 'text',
  onChange
}: {
  icon: typeof Bot
  label: string
  value: string
  placeholder: string
  type?: 'text' | 'password'
  onChange: (value: string) => void
}): React.JSX.Element {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-xs">
        <Icon className="size-3.5 text-muted-foreground" />
        {label}
      </Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
