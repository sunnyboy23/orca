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
    expect(classifyFeishuDevelopmentTaskIntent('任务 修复飞书消息实时刷新')).toEqual({
      shouldCreate: true,
      spec: '修复飞书消息实时刷新'
    })
  })

  it('creates tasks for actionable development requests', () => {
    expect(classifyFeishuDevelopmentTaskIntent('帮我实现飞书消息实时通信')).toEqual({
      shouldCreate: true,
      spec: '帮我实现飞书消息实时通信'
    })
    expect(classifyFeishuDevelopmentTaskIntent('修复设置按钮白屏 bug')).toEqual({
      shouldCreate: true,
      spec: '修复设置按钮白屏 bug'
    })
  })

  it('leaves unclear text as a recorded channel message', () => {
    expect(classifyFeishuDevelopmentTaskIntent('这个看起来有点慢')).toEqual({
      shouldCreate: false,
      reason: 'unclear'
    })
  })
})
