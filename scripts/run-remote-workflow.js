import { execFile } from 'node:child_process'
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
    '--limit',
    '1',
    '--json',
    'databaseId,status,conclusion,url',
  ])

  return JSON.parse(output)[0]
}

async function main() {
  await gh(['workflow', 'run', workflow, '--repo', repo, '--ref', ref])
  console.log(`Triggered ${workflow} on ${repo}@${ref}`)

  await wait(5000)
  const run = await latestRun()

  if (!run) {
    throw new Error('Workflow was triggered, but no run was found yet.')
  }

  console.log(`Run: ${run.url}`)

  if (shouldWatch) {
    await exec('gh', ['run', 'watch', String(run.databaseId), '--repo', repo, '--exit-status'], {
      stdio: 'inherit',
    })
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
