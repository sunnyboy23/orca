import { describe, expect, it } from 'vitest'
import { classifyFeishuDevelopmentTaskIntent } from './development-task-intent'

describe('classifyFeishuDevelopmentTaskIntent', () => {
  it.each(['你好', 'hi', '在吗？', '收到'])('ignores casual message %s', (text) => {
    expect(classifyFeishuDevelopmentTaskIntent(text)).toEqual({
      shouldCreate: false,
      reason: 'casual'
    })
  })

  it('creates tasks for explicit task prefixes', () => {
    expect(classifyFeishuDevelopmentTaskIntent('转为任务 修复飞书消息实时刷新')).toEqual({
      shouldCreate: true,
      spec: '修复飞书消息实时刷新'
    })
    expect(classifyFeishuDevelopmentTaskIntent('/run fix Feishu realtime sync')).toEqual({
      shouldCreate: true,
      spec: 'fix Feishu realtime sync'
    })
  })

  it('records actionable text until the user explicitly promotes it to a task', () => {
    expect(classifyFeishuDevelopmentTaskIntent('帮我实现飞书消息实时通信')).toEqual({
      shouldCreate: false,
      reason: 'unclear'
    })
    expect(classifyFeishuDevelopmentTaskIntent('修复设置按钮白屏 bug')).toEqual({
      shouldCreate: false,
      reason: 'unclear'
    })
    expect(classifyFeishuDevelopmentTaskIntent('任务 修复一个测试问题')).toEqual({
      shouldCreate: false,
      reason: 'unclear'
    })
  })

  it('leaves unclear text as a recorded channel message', () => {
    expect(classifyFeishuDevelopmentTaskIntent('这个看起来有点慢')).toEqual({
      shouldCreate: false,
      reason: 'unclear'
    })
  })
})
