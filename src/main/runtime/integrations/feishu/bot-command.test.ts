import { describe, expect, it } from 'vitest'
import { parseFeishuBotCommand } from './bot-command'

describe('parseFeishuBotCommand', () => {
  it.each([
    ['帮助', { type: 'help' }],
    ['help', { type: 'help' }],
    ['/status', { type: 'status' }],
    ['状态', { type: 'status' }],
    ['停止', { type: 'stop' }],
    ['cancel', { type: 'stop' }]
  ])('parses control command %s', (input, expected) => {
    expect(parseFeishuBotCommand(input)).toEqual(expected)
  })

  it('parses continuation commands with a body', () => {
    expect(parseFeishuBotCommand('继续 选择方案一')).toEqual({
      type: 'continue',
      body: '选择方案一'
    })
    expect(parseFeishuBotCommand('/continue: approve')).toEqual({
      type: 'continue',
      body: 'approve'
    })
  })

  it('treats ordinary text as a new run spec', () => {
    expect(parseFeishuBotCommand('帮我修复登录页中文溢出')).toEqual({
      type: 'run',
      spec: '帮我修复登录页中文溢出'
    })
  })

  it('normalizes blank lines before parsing', () => {
    expect(parseFeishuBotCommand('\n  状态 \n')).toEqual({ type: 'status' })
    expect(parseFeishuBotCommand(' \n ')).toEqual({ type: 'empty' })
  })
})
