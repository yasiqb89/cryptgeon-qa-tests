import { test } from '@playwright/test'
import { CreateNotePage } from '../pages/CreateNotePage'
import { NotePage } from '../pages/NotePage'
import { uniqueSecret } from './support/testData'

// Grouped tests for Cryptgeon note lifecycle
test.describe('Cryptgeon note lifecycle', () => {
  // Happy path: creates a secret note, opens its share link, and verifies decrypted content.
  test('creates and reads a text note', async ({ page }) => {
    const createNotePage = new CreateNotePage(page)
    const notePage = new NotePage(page)
    const text = uniqueSecret('create-read')

    const link = await createNotePage.createTextNote(text)
    await notePage.openAndReveal(link)

    await notePage.expectTextVisible(text)
  })

  // Password check: verifies a note protected with a custom password can be decrypted.
  test('creates and reads a password-protected text note', async ({ page }) => {
    const createNotePage = new CreateNotePage(page)
    const notePage = new NotePage(page)
    const text = uniqueSecret('password')
    const password = uniqueSecret('custom-password')

    const link = await createNotePage.createPasswordProtectedTextNote({ password, text })
    await notePage.openAndRevealPasswordProtectedNote({ link, password })

    await notePage.expectTextVisible(text)
  })

  // Timer check: verifies a time-limited note disappears after its expiration window.
  test('expires a text note after the configured timer', async ({ page }) => {
    test.setTimeout(90_000)

    const createNotePage = new CreateNotePage(page)
    const notePage = new NotePage(page)
    const text = uniqueSecret('expiration')

    const link = await createNotePage.createExpiringTextNote({ expirationMinutes: 1, text })
    await notePage.openAndReveal(link)
    await notePage.expectTextVisible(text)

    await page.waitForTimeout(65_000)
    await notePage.open(link)
    await notePage.expectDeletedOrNotFound()
  })

  // Self-destruct check: verifies a default one-view note disappears after one read.
  test('deletes a one-view note after it is read', async ({ page }) => {
    const createNotePage = new CreateNotePage(page)
    const notePage = new NotePage(page)
    const text = uniqueSecret('one-view-delete')

    const link = await createNotePage.createTextNote(text)
    await notePage.openAndReveal(link)
    await notePage.expectTextVisible(text)

    await notePage.open(link)
    await notePage.expectDeletedOrNotFound()
  })

  // Non-persistence check: verifies a one-view note is gone after it has been read.
  test('does not persist a one-view note after it is read', async ({ page }) => {
    const createNotePage = new CreateNotePage(page)
    const notePage = new NotePage(page)
    const text = uniqueSecret('does-not-persist')

    const link = await createNotePage.createTextNote(text)
    await notePage.openAndReveal(link)
    await notePage.expectTextVisible(text)

    // Reloading the consumed share link should show the deleted/not-found state.
    await page.reload()
    await notePage.expectDeletedOrNotFound()
  })
})
