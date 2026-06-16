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

Useful focused runs:

```bash
npx playwright test tests/notes.spec.ts
npx playwright test -g "creates and reads a text note"
npx playwright test --grep @smoke
```

Run headed:

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

Tests use tags such as `@smoke`, `@functional`, `@regression`, `@password`, and `@bug`.
The `@bug` generated-password sharing test is marked with Playwright `test.fail(...)`, so it documents the known product issue without failing CI.

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

## Notion Test Case Tracker

The manual/test-case tracker is available as a view-only Notion page:

[Cryptgeon QA Test Cases](https://app.notion.com/p/d91ba52b4486436d948530122210e909?v=38178e34662681bb82ce000c9611cb16&source=copy_link)

## Remote Run

GitHub Actions runs the Playwright suite and syncs results back to Notion.

Run the workflow manually:

```bash
gh workflow run "Cryptgeon QA" --repo yasiqb89/cryptgeon-qa-tests --ref main
```

Watch the run:

```bash
gh run watch --repo yasiqb89/cryptgeon-qa-tests --exit-status
```

The Notion token is already configured as a GitHub Actions secret in this repository.
Reviewers only need the GitHub repository link and the shared Notion page link; they do not need the token.

The workflow also runs automatically on pushes to `main`, pull requests, and the daily schedule.
