import type {
  ExperimentalMessages,
  InputMessages,
  PrivacyMessages,
  TasksMessages
} from './settings-core-panes-types'

export const inputZhCN: InputMessages = {
  middleClickPaste: {
    title: '中键粘贴选中内容',
    description:
      'Linux 和 macOS 默认开启。Linux 使用系统的 primary selection 剪贴板，其他平台使用 Orca 的私有缓冲区。',
    keywords: [
      '输入',
      '编辑',
      '选中',
      'primary selection',
      '中键',
      '鼠标中键',
      '粘贴',
      '剪贴板',
      'x11',
      'linux',
      'macos'
    ]
  }
}

export const tasksZhCN: TasksMessages = {
  header: {
    title: '任务来源',
    description:
      '选择哪些任务来源显示在任务页的来源选择器和侧边栏快捷入口中。至少需要保留一个来源。'
  },
  providersSearch: {
    title: '任务来源',
    description: '选择哪些任务来源显示在任务页和侧边栏快捷入口中。',
    keywords: ['任务', '来源', '提供方', 'github', 'gitlab', 'linear', '显示', '隐藏']
  },
  providerDescriptions: {
    github: '在任务来源选择器和侧边栏快捷入口中显示 GitHub。',
    gitlab: '在任务来源选择器和侧边栏快捷入口中显示 GitLab。',
    linear: '在任务来源选择器和侧边栏快捷入口中显示 Linear。'
  }
}

export const experimentalZhCN: ExperimentalMessages = {
  pet: {
    title: '桌面伙伴',
    description:
      '在右下角显示一个小型动态伙伴。可从状态栏菜单选择角色（Claudino、OpenCode、Gremlin），也可以上传自己的 PNG、APNG、GIF、WebP、JPG 或 SVG；隐藏时不会关闭这个设置。',
    keywords: ['实验', '伙伴', '宠物', '吉祥物', '悬浮', '动画', '角落', '角色', 'pet']
  },
  agentsView: {
    title: 'Agents 视图',
    description:
      '在左侧边栏加入 Agents 入口，以线程形式展示已完成 Agent、阻塞问题、未读状态和 worktree 创建事件。该功能仍处于实验阶段，事件模型和界面可能调整。',
    keywords: [
      '实验',
      'agents',
      'agent',
      '视图',
      '活动',
      '通知',
      'worktree',
      '时间线',
      '未读',
      '侧边栏'
    ]
  },
  symlinks: {
    title: '为 worktree 创建符号链接',
    description:
      '新建 worktree 时自动把配置的文件或文件夹软链接进去，让 env、缓存、依赖安装等共享状态保持连通。',
    keywords: [
      '实验',
      'worktree',
      '符号链接',
      '软链接',
      'symlink',
      '链接',
      '共享',
      'env',
      'node_modules'
    ]
  },
  missingSearchEntry: (title) => `缺少 Experimental 搜索项：“${title}”`
}

export const privacyZhCN: PrivacyMessages = {
  telemetry: {
    title: '共享匿名使用数据',
    description:
      '帮助我们判断下一步该改进什么。Orca 只发送匿名统计，例如你使用了哪些功能，以及哪些地方出错。',
    keywords: ['遥测', '使用数据', '匿名', '同意', '退出', '共享', 'telemetry'],
    policyLink: '隐私政策',
    ariaLabel: '共享匿名使用数据'
  },
  blocked: {
    ci: '检测到 CI 环境变量，遥测已关闭。取消该变量并重启后可重新启用。',
    env: (envName) => `遥测已被 ${envName} 环境变量关闭。取消该变量并重启后可重新启用。`
  },
  diagnostics: {
    search: {
      pane: {
        title: '隐私与遥测',
        description: '匿名产品使用数据、诊断信息和遥测控制。',
        keywords: ['隐私', '遥测', '分析', '使用', '匿名', '数据', 'posthog', '退出', '同意']
      },
      bundle: {
        title: '诊断信息',
        description: 'trace 文件和 OTLP 导出控制。',
        keywords: ['诊断', 'trace', '日志', 'otlp', 'opentelemetry', '支持']
      },
      environment: {
        title: '遥测环境变量',
        description: '会关闭遥测发送的环境变量。',
        keywords: [
          'do not track',
          'do_not_track',
          'orca_telemetry_disabled',
          'ci',
          'continuous integration',
          '环境变量',
          '关闭'
        ]
      }
    },
    toasts: {
      openTraceFolderFailed: '无法打开 trace 文件夹',
      localTracesCleared: '本地 trace 文件已清除',
      clearTraceFilesFailed: '无法清除 trace 文件',
      previewCreated: '诊断包预览已创建',
      previewCreateFailed: '无法创建诊断包',
      previewOpened: '诊断包预览已打开',
      previewOpenFailed: '无法打开诊断包预览',
      bundleUploaded: '诊断包已上传',
      bundleUploadFailed: '无法上传诊断包',
      previewDiscarded: '诊断包预览已丢弃',
      previewDiscardFailed: '无法丢弃诊断包预览',
      ticketCopied: '诊断 ticket 已复制',
      ticketCopyFailed: '无法复制诊断 ticket',
      uploadedBundleDeleted: '已删除上传的诊断包',
      bundleDeleteFailed: '无法删除诊断包'
    },
    bundle: {
      title: '诊断包',
      uploadedTicket: (ticketId) => `已上传 ticket ${ticketId}。`,
      readyToUpload: '可以上传。',
      openPreviewBeforeUpload: '上传前请先打开预览。',
      spanSummary: (spanCount, bytes, previewState) =>
        `${spanCount} 个 span，${bytes}。${previewState}`,
      redactedPreview: '创建一份已脱敏的 NDJSON 预览，用于上传给支持人员排查。',
      copyTicket: '复制 ticket',
      deleteBundle: '删除诊断包',
      done: '完成',
      openPreview: '打开预览',
      upload: '上传',
      discard: '丢弃',
      createPreview: '创建预览'
    },
    traceFolder: {
      title: '打开 trace 文件夹',
      fallbackPath: 'trace 文件夹',
      description: (path) => `在文件管理器中显示 ${path}。`,
      action: '打开 trace 文件夹'
    },
    clearTraces: {
      title: '清除本地 trace',
      description: '删除这台机器上所有轮转保存的 trace 文件。',
      action: '清除本地 trace'
    },
    otlp: {
      title: 'OTLP 导出',
      description: '设置 ORCA_OTLP_TRACES_URL 后，Orca 会把 trace 发送到你的 OpenTelemetry collector。',
      enabled: '已启用',
      disabled: '已关闭'
    },
    disabledNote: {
      doNotTrack: '已设置 DO_NOT_TRACK=1，联网诊断已关闭；本地 trace 文件仍会写入。',
      telemetryDisabled:
        '已设置 ORCA_TELEMETRY_DISABLED=1，联网诊断已关闭；本地 trace 文件仍会写入。',
      diagnosticsDisabled:
        '已设置 ORCA_DIAGNOSTICS_DISABLED=1，所有诊断能力都已关闭，包括本地 trace 写入。',
      ci: '当前运行在 CI 中，诊断功能已关闭。',
      fallback: '诊断功能已被某个环境变量关闭。'
    }
  }
}
