import { describe, expect, it } from 'vitest'
import { Files } from 'lucide-react'
import type { ActivityBarItem } from './activity-bar-buttons'
import { getVisibleRightSidebarActivityItems } from './right-sidebar-activity-visibility'

const items: ActivityBarItem[] = [
  { id: 'explorer', icon: Files, title: 'Explorer', shortcut: '' },
  { id: 'source-control', icon: Files, title: 'Source Control', shortcut: '', gitOnly: true },
  { id: 'ports', icon: Files, title: 'Ports', shortcut: '', sshOnly: true },
  { id: 'feishu', icon: Files, title: 'Feishu', shortcut: '' }
]

describe('getVisibleRightSidebarActivityItems', () => {
  it('shows ports only for SSH repos', () => {
    expect(
      getVisibleRightSidebarActivityItems(items, { isFolder: false, isSshRepo: false }).map(
        (item) => item.id
      )
    ).toEqual(['explorer', 'source-control', 'feishu'])

    expect(
      getVisibleRightSidebarActivityItems(items, { isFolder: false, isSshRepo: true }).map(
        (item) => item.id
      )
    ).toEqual(['explorer', 'source-control', 'ports', 'feishu'])
  })

  it('still hides git-only tabs for folder repos', () => {
    expect(
      getVisibleRightSidebarActivityItems(items, { isFolder: true, isSshRepo: true }).map(
        (item) => item.id
      )
    ).toEqual(['explorer', 'ports', 'feishu'])
  })
})
