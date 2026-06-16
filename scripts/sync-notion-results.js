import fs from 'node:fs/promises'
import path from 'node:path'

const RESULT_TO_STATUS = {
  Passed: 'Done',
  Failed: 'Needs Review',
  Blocked: 'Needs Review',
}

const NOTION_VERSION = process.env.NOTION_VERSION ?? '2022-06-28'
const notionToken = process.env.NOTION_TOKEN
const databaseId = process.env.NOTION_TEST_CASES_DATABASE_ID
const titleProperty = process.env.NOTION_TEST_TITLE_PROPERTY ?? 'Test Function'
const fallbackTitleProperty = process.env.NOTION_TEST_CASE_PROPERTY ?? 'Test Case'
const resultsPath = process.argv[2] ?? process.env.PLAYWRIGHT_JSON_OUTPUT_NAME ?? 'playwright-results.json'

if (!notionToken) {
  throw new Error('Missing NOTION_TOKEN. Add it as a GitHub Actions secret or export it locally.')
}

if (!databaseId) {
  throw new Error('Missing NOTION_TEST_CASES_DATABASE_ID. Add it as a GitHub Actions variable or export it locally.')
}

const notionHeaders = {
  Authorization: `Bearer ${notionToken}`,
  'Content-Type': 'application/json',
  'Notion-Version': NOTION_VERSION,
}

function normalize(value) {
  return String(value ?? '').trim().toLowerCase()
}

function runUrl() {
  const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env
  if (!GITHUB_SERVER_URL || !GITHUB_REPOSITORY || !GITHUB_RUN_ID) {
    return null
  }

  return `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`
}

async function notionRequest(endpoint, options = {}) {
  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    ...options,
    headers: {
      ...notionHeaders,
      ...options.headers,
    },
  })

  const bodyText = await response.text()
  const body = bodyText ? JSON.parse(bodyText) : {}

  if (!response.ok) {
    const message = body.message ?? response.statusText
    const error = new Error(`Notion API ${response.status} for ${endpoint}: ${message}`)
    error.status = response.status
    error.body = body
    throw error
  }

  return body
}

async function queryDatabasePage(endpoint, cursor) {
  return notionRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      page_size: 100,
      start_cursor: cursor,
    }),
  })
}

async function queryAllTestCases() {
  const endpoints = [
    `/databases/${databaseId}/query`,
    `/data_sources/${databaseId}/query`,
  ]

  let lastError

  for (const endpoint of endpoints) {
    const pages = []
    let cursor

    try {
      do {
        const result = await queryDatabasePage(endpoint, cursor)
        pages.push(...result.results)
        cursor = result.has_more ? result.next_cursor : undefined
      } while (cursor)

      return pages
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}

function plainText(property) {
  if (!property) {
    return ''
  }

  if (property.type === 'title') {
    return property.title.map((part) => part.plain_text).join('')
  }

  if (property.type === 'rich_text') {
    return property.rich_text.map((part) => part.plain_text).join('')
  }

  return ''
}

function finalResultForSpec(spec) {
  const attempts = (spec.tests ?? []).flatMap((test) => test.results ?? [])
  const finalAttempt = attempts.at(-1)

  if (!finalAttempt) {
    return {
      result: 'Blocked',
      failureSummary: 'No Playwright result attempt was recorded for this test.',
    }
  }

  if (finalAttempt.status === 'passed') {
    return { result: 'Passed', failureSummary: '' }
  }

  if (finalAttempt.status === 'skipped' || finalAttempt.status === 'interrupted') {
    return {
      result: 'Blocked',
      failureSummary: `Playwright status: ${finalAttempt.status}`,
    }
  }

  const errorMessage = finalAttempt.error?.message ?? finalAttempt.errors?.[0]?.message ?? ''

  return {
    result: 'Failed',
    failureSummary: errorMessage.slice(0, 1800),
  }
}

function collectSpecs(suites, specs = []) {
  for (const suite of suites ?? []) {
    for (const spec of suite.specs ?? []) {
      specs.push({
        title: spec.title,
        file: spec.file,
        ...finalResultForSpec(spec),
      })
    }

    collectSpecs(suite.suites, specs)
  }

  return specs
}

async function loadPlaywrightResults() {
  const absolutePath = path.resolve(resultsPath)
  const raw = await fs.readFile(absolutePath, 'utf8')
  const report = JSON.parse(raw)
  const specs = collectSpecs(report.suites)

  if (specs.length === 0) {
    throw new Error(`No specs found in Playwright JSON report at ${absolutePath}`)
  }

  return specs
}

function buildPageIndex(pages) {
  const index = new Map()

  for (const page of pages) {
    const primaryTitle = plainText(page.properties[titleProperty])
    const fallbackTitle = plainText(page.properties[fallbackTitleProperty])

    for (const title of [primaryTitle, fallbackTitle]) {
      const key = normalize(title)
      if (key) {
        index.set(key, page)
      }
    }
  }

  return index
}

function richText(content) {
  return content
    ? [{ type: 'text', text: { content } }]
    : []
}

function buildProperties(page, spec, timestamp, currentRunUrl) {
  const properties = page.properties
  const result = spec.result
  const update = {
    Result: { select: { name: result } },
    Status: { select: { name: RESULT_TO_STATUS[result] } },
  }

  if (properties['Last Run']) {
    update['Last Run'] = { date: { start: timestamp } }
  }

  if (properties['Run URL'] && currentRunUrl) {
    update['Run URL'] = { url: currentRunUrl }
  }

  if (properties['Failure Summary']) {
    update['Failure Summary'] = { rich_text: richText(spec.failureSummary) }
  }

  return update
}

async function updateTestCase(page, spec, timestamp, currentRunUrl) {
  await notionRequest(`/pages/${page.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      properties: buildProperties(page, spec, timestamp, currentRunUrl),
    }),
  })
}

async function main() {
  const [specs, pages] = await Promise.all([
    loadPlaywrightResults(),
    queryAllTestCases(),
  ])
  const pageIndex = buildPageIndex(pages)
  const timestamp = new Date().toISOString()
  const currentRunUrl = runUrl()
  const unmatched = []
  const updated = []

  for (const spec of specs) {
    const page = pageIndex.get(normalize(spec.title))

    if (!page) {
      unmatched.push(`${spec.title} (${spec.file})`)
      continue
    }

    await updateTestCase(page, spec, timestamp, currentRunUrl)
    updated.push(`${spec.title}: ${spec.result}`)
  }

  console.log(`Updated ${updated.length} Notion test case(s).`)
  for (const line of updated) {
    console.log(`- ${line}`)
  }

  if (unmatched.length > 0) {
    console.warn('\nNo matching Notion test case was found for:')
    for (const line of unmatched) {
      console.warn(`- ${line}`)
    }
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
