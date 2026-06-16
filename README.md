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

Run the full suite:

```bash
npm test
```

Run one spec file:

```bash
npx playwright test tests/notes.spec.ts
```

Run one test by title:

```bash
npx playwright test -g "creates and reads a text note"
```

Run tests by tag:

```bash
npx playwright test --grep @smoke
npx playwright test --grep @functional
npx playwright test --grep @regression
npx playwright test --grep @password
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
- Dice-generated password note can be decrypted when the generated password is captured in the test and shared separately.
- Time-limited note expires after the configured timer.
- A default one-view note is deleted after it is read.
- A consumed one-view note is not available after reload.
- Known generated-password sharing gap is tracked as an expected failing `@bug` test.

## Tags

Tests are tagged so they can be run as a full suite or filtered for targeted checks.

```text
@smoke                Basic deployment and UI availability
@ui                   UI rendering checks
@functional           Main happy-path behavior
@regression           Deletion and expiration behavior
@note                 Standard note creation and reading
@password             Custom and generated password behavior
@generated-password   Dice-generated password behavior
@expiration           Time-limited note behavior
@one-view             One-view/self-destruct behavior
@bug                  Known product gap coverage
```

The `@bug` generated-password sharing test is intentionally marked with Playwright `test.fail(...)`. It still runs in the normal suite and documents the missing copy/share control, but CI stays green while the product bug is known. If the app later adds a generated-password copy/share control, remove `test.fail(...)` and keep the assertion as normal regression coverage.

## Structure

```text
pages/                 Page Object Model classes
tests/                 Playwright test specs
tests/fixtures/        Playwright fixtures that inject page objects
tests/support/         Test data and shared helpers
types/                 Shared TypeScript test data types
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

Notion setup:

- Share the Notion test-case database/page with the Notion integration.
- Add the integration token as `NOTION_TOKEN`.
- The token is created from Notion integrations and is stored only as a local environment variable or GitHub Actions secret.
- The default database ID is already configured in `scripts/sync-notion-results.js`; override it with `NOTION_TEST_CASES_DATABASE_ID` only if the database changes.

Local sync:

```bash
export NOTION_TOKEN=your_notion_integration_token
export NOTION_TEST_CASES_DATABASE_ID=your_database_id
PLAYWRIGHT_JSON_OUTPUT_NAME=playwright-results.json npm test
npm run sync:notion
```

Remote GitHub Actions run:

```bash
gh workflow run "Cryptgeon QA" --repo yasiqb89/cryptgeon-qa-tests --ref main
```

Watch the latest GitHub Actions run until it finishes:

```bash
gh run watch --repo yasiqb89/cryptgeon-qa-tests --exit-status
```

GitHub Actions sync:

- Add repository secret `NOTION_TOKEN` with a Notion integration token.
- Optionally add repository variable `NOTION_TEST_CASES_DATABASE_ID` with the Notion database ID. If omitted, the current Cryptgeon QA database ID is used.
- If `NOTION_TOKEN` is missing, the workflow skips Notion sync and still runs the Playwright tests.

The workflow runs on pushes to `main`, pull requests, manual dispatch, and the daily schedule. Playwright results are uploaded as an artifact named `playwright-report`.
