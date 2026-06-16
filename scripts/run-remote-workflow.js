import { execFile, spawn } from 'node:child_process'
import { promisify } from 'node:util'

const exec = promisify(execFile)

const repo = process.env.GITHUB_REPOSITORY ?? 'yasiqb89/cryptgeon-qa-tests'
const workflow = process.env.GITHUB_WORKFLOW_NAME ?? 'Cryptgeon QA'
const ref = process.env.GITHUB_REF_NAME ?? 'main'
const shouldWatch = process.argv.includes('--watch')

async function gh(args, options = {}) {
  const { stdout } = await exec('gh', args, {
    maxBuffer: 1024 * 1024,
    ...options,
  })

  return stdout.trim()
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function latestRun() {
  const output = await gh([
    'run',
    'list',
    '--repo',
    repo,
    '--workflow',
    workflow,
    '--event',
    'workflow_dispatch',
    '--limit',
    '1',
    '--json',
    'createdAt,databaseId,status,conclusion,url',
  ])

  return JSON.parse(output)[0]
}

async function latestRunAfter(triggeredAt) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const run = await latestRun()

    if (run && new Date(run.createdAt) >= triggeredAt) {
      return run
    }

    await wait(5000)
  }

  return null
}

function watchRun(runId) {
  return new Promise((resolve) => {
    const child = spawn('gh', ['run', 'watch', String(runId), '--repo', repo, '--exit-status'], {
      stdio: 'inherit',
    })

    child.on('exit', (code) => resolve(code ?? 1))
  })
}

async function main() {
  const triggeredAt = new Date(Date.now() - 5000)
  await gh(['workflow', 'run', workflow, '--repo', repo, '--ref', ref])
  console.log(`Triggered ${workflow} on ${repo}@${ref}`)

  const run = await latestRunAfter(triggeredAt)

  if (!run) {
    throw new Error('Workflow was triggered, but no run was found yet.')
  }

  console.log(`Run: ${run.url}`)

  if (shouldWatch) {
    process.exitCode = await watchRun(run.databaseId)
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
