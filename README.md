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

## Current Coverage

- App loads and shows the create-note UI.
- User can create a text note.
- Generated share link can be opened.
- Revealed note content matches the original secret text.
- Password-protected text note can be decrypted with the custom password.
- Time-limited note expires after the configured timer.
- A default one-view note is deleted after it is read.
- A consumed one-view note is not available after reload.

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

## Optional Test Case Tracker

The manual/test-case tracker is available as a view-only Notion page:

[Cryptgeon QA Test Cases](https://app.notion.com/p/d91ba52b4486436d948530122210e909?v=38178e34662681bb82ce000c9611cb16&source=copy_link)

## Optional Notion Result Sync

Notion sync is optional reporting and is not required to run the assignment tests.

Automation flow:

1. Playwright writes a JSON result file when `PLAYWRIGHT_JSON_OUTPUT_NAME` is set.
2. `scripts/sync-notion-results.js` reads that JSON file.
3. The script matches each Playwright test title to the Notion `Test Function` field.
4. The matching Notion row is updated with `Result`, `Status`, `Last Run`, `Run URL`, and `Failure Summary`.

Local sync:

```bash
export NOTION_TOKEN=your_notion_integration_token
export NOTION_TEST_CASES_DATABASE_ID=your_database_id
PLAYWRIGHT_JSON_OUTPUT_NAME=playwright-results.json npm test
npm run sync:notion
```

Remote GitHub Actions run:

```bash
npm run test:remote
```

Remote GitHub Actions run and watch until it finishes:

```bash
npm run test:remote:watch
```

GitHub Actions sync:

- Add repository secret `NOTION_TOKEN` with a Notion integration token.
- Optionally add repository variable `NOTION_TEST_CASES_DATABASE_ID` with the Notion database ID. If omitted, the current Cryptgeon QA database ID is used.
- If `NOTION_TOKEN` is missing, the workflow skips Notion sync and still runs the Playwright tests.
