# Cryptgeon QA Tests

Playwright tests for the deployed Cryptgeon instance used in the QA practical assignment.

Default target:

```text
http://onetimeshare.gsfleet.io
```

## Setup

```bash
npm install
npx playwright install chromium
```

## Run

```bash
npm test
```

Run with a visible browser for the live demo:

```bash
npm run test:headed
```

Override the target URL if needed:

```bash
CRYPTGEON_BASE_URL=http://onetimeshare.gsfleet.io npm test
```

## Notion Result Sync

The Notion tracker lives under `Assignment - Cryptgeon` in the `Cryptgeon QA Test Cases` database.

Automation flow:

1. Playwright writes a JSON result file when `PLAYWRIGHT_JSON_OUTPUT_NAME` is set.
2. `scripts/sync-notion-results.js` reads that JSON file.
3. The script matches each Playwright test title to the Notion `Test Function` field.
4. The matching Notion row is updated with `Result`, `Status`, `Last Run`, `Run URL`, and `Failure Summary`.

Result mapping:

```text
passed                 Result = Passed, Status = Done
failed/timedOut        Result = Failed, Status = Needs Review
skipped/interrupted    Result = Blocked, Status = Needs Review
```

Local sync:

```bash
export NOTION_TOKEN=secret_xxx
export NOTION_TEST_CASES_DATABASE_ID=d91ba52b4486436d948530122210e909
PLAYWRIGHT_JSON_OUTPUT_NAME=playwright-results.json npm test
npm run sync:notion
```

GitHub Actions sync:

- Add repository secret `NOTION_TOKEN` with a Notion integration token that has edit access to the test-case database.
- Optionally add repository variable `NOTION_TEST_CASES_DATABASE_ID`. If omitted, the workflow uses the current Cryptgeon QA database ID.
- The workflow runs on pushes to `main`, pull requests, daily at 07:00 UTC, and manual dispatch.

Run tests and sync locally in one command:

```bash
npm run test:sync:notion
```

## Current Coverage

- App loads and shows the create-note UI.
- User can create a text note.
- Generated share link can be opened.
- Revealed note content matches the original secret text.

## Structure

```text
pages/                 Page Object Model classes
tests/                 Playwright test specs
tests/support/         Test data and shared helpers
```

The tests keep scenario steps readable, while selectors and page actions live in page objects.

Current spec grouping:

```text
tests/smoke.spec.ts    Deployment smoke checks
tests/notes.spec.ts    Note creation, reading, and deletion behavior
```
