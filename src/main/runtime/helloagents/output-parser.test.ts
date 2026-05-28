import { describe, expect, it } from 'vitest'
import { parseOrchestratorEvent, parseOrchestratorOutput } from './output-parser'

describe('parseOrchestratorOutput', () => {
  it('parses an R0 routing event from a fenced JSON block', () => {
    const result = parseOrchestratorOutput(`
Hello.

\`\`\`json
{
  "type": "routing",
  "mode": "r0",
  "summary": "Explain the current file",
  "response": "This is a read-only answer."
}
\`\`\`
`)

    expect(result).toEqual({
      ok: true,
      event: {
        type: 'routing',
        mode: 'r0',
        summary: 'Explain the current file',
        response: 'This is a read-only answer.',
        task: undefined
      }
    })
  })

  it('infers routing type and normalizes an R1 task', () => {
    const result = parseOrchestratorOutput(`
\`\`\`helloagents
{
  "mode": "r1",
  "summary": "Fix one bug",
  "task": {
    "id": "task_fix",
    "title": "Fix bug",
    "spec": "Patch the failing branch.",
    "repo_name": "orca",
    "deps": []
  }
}
\`\`\`
`)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.event).toMatchObject({
        type: 'routing',
        mode: 'r1',
        task: {
          id: 'task_fix',
          repoName: 'orca',
          artifactRequired: true
        }
      })
    }
  })

  it('parses a task DAG event', () => {
    const result = parseOrchestratorOutput(`
\`\`\`json
{
  "type": "task_dag",
  "tasks": [
    {
      "id": "task_api",
      "title": "Backend API",
      "spec": "Implement API.",
      "repoName": "backend",
      "deps": [],
      "artifactRequired": true
    },
    {
      "id": "task_ui",
      "title": "Frontend UI",
      "spec": "Call API.",
      "repoName": "frontend",
      "deps": ["task_api"],
      "artifact_required": false
    }
  ]
}
\`\`\`
`)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.event).toEqual({
        type: 'task_dag',
        tasks: [
          {
            id: 'task_api',
            title: 'Backend API',
            spec: 'Implement API.',
            repoName: 'backend',
            deps: [],
            artifactRequired: true
          },
          {
            id: 'task_ui',
            title: 'Frontend UI',
            spec: 'Call API.',
            repoName: 'frontend',
            deps: ['task_api'],
            artifactRequired: false
          }
        ]
      })
    }
  })

  it('parses a gate event and run status event', () => {
    const gate = parseOrchestratorEvent({
      question: 'Proceed?',
      options: ['yes', 'no'],
      gate_id: 'gate_1'
    })
    const status = parseOrchestratorEvent({
      status: 'completed',
      summary: 'All tasks passed'
    })

    expect(gate).toEqual({
      ok: true,
      event: {
        type: 'gate',
        gateId: 'gate_1',
        question: 'Proceed?',
        options: ['yes', 'no']
      }
    })
    expect(status).toEqual({
      ok: true,
      event: {
        type: 'run_status',
        status: 'completed',
        summary: 'All tasks passed',
        reason: undefined
      }
    })
  })

  it('returns invalid_json for malformed fenced JSON', () => {
    const result = parseOrchestratorOutput(`
\`\`\`json
{ "mode": "r1",
\`\`\`
`)

    expect(result).toMatchObject({
      ok: false,
      error: { kind: 'invalid_json' }
    })
  })

  it('returns invalid_schema for missing required fields', () => {
    const result = parseOrchestratorOutput(`
\`\`\`json
{ "type": "task_dag", "tasks": [] }
\`\`\`
`)

    expect(result).toMatchObject({
      ok: false,
      error: { kind: 'invalid_schema' }
    })
  })

  it('returns missing_block when no fenced JSON is present', () => {
    expect(parseOrchestratorOutput('plain text only')).toEqual({
      ok: false,
      error: {
        kind: 'missing_block',
        message: 'No fenced Orchestrator JSON block found'
      }
    })
  })
})
