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
