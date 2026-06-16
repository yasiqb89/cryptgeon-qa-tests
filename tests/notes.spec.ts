import { expect, test } from './fixtures/pages'
import { uniqueSecret } from './support/testData'

// Grouped tests for Cryptgeon note lifecycle
test.describe('Cryptgeon note lifecycle', () => {
  // Happy path: creates a secret note, opens its share link, and verifies decrypted content.
  test('creates and reads a text note', { tag: ['@functional', '@note'] }, async ({
    createNotePage,
    notePage,
  }) => {
    const text = uniqueSecret('create-read')

    const link = await createNotePage.createTextNote(text)
    await notePage.openAndReveal(link)

    await notePage.expectTextVisible(text)
  })

  // Password check: verifies a note protected with a custom password can be decrypted.
  test(
    'creates and reads a password-protected text note',
    { tag: ['@functional', '@password'] },
    async ({ createNotePage, notePage }) => {
      const text = uniqueSecret('password')
      const password = uniqueSecret('custom-password')

      const link = await createNotePage.createPasswordProtectedTextNote({ password, text })
      await notePage.openAndRevealPasswordProtectedNote({ link, password })

      await notePage.expectTextVisible(text)
    },
  )

  // Generated password check: verifies the dice-generated password can decrypt the note when shared separately.
  test(
    'creates and reads a generated-password text note',
    { tag: ['@functional', '@password', '@generated-password'] },
    async ({ createNotePage, notePage }) => {
      const text = uniqueSecret('generated-password')

      const note = await createNotePage.createGeneratedPasswordProtectedTextNote({ text })
      await notePage.openAndRevealPasswordProtectedNote(note)

      await notePage.expectTextVisible(text)
    },
  )

  // Bug coverage: the generated password works, but the UI lacks an explicit copy/share control.
  test(
    'provides a shareable generated password control',
    { tag: ['@bug', '@password', '@generated-password'] },
    async ({ createNotePage, page }) => {
      await createNotePage.goto()
      await createNotePage.advancedSwitch.click()
      await createNotePage.customPasswordSwitch.click()
      await createNotePage.generatePasswordButton.click()

      // This expectation documents the missing UX affordance and should fail until the app adds it.
      await expect(createNotePage.passwordInput).not.toHaveValue('')
      await expect(page.getByRole('button', { name: /copy.*password|password.*copy/i })).toBeVisible()
    },
  )

  // Timer check: verifies a time-limited note disappears after its expiration window.
  test(
    'expires a text note after the configured timer',
    { tag: ['@regression', '@expiration'] },
    async ({ createNotePage, notePage, page }) => {
      test.setTimeout(90_000)

      const text = uniqueSecret('expiration')

      const link = await createNotePage.createExpiringTextNote({ expirationMinutes: 1, text })
      await notePage.openAndReveal(link)
      await notePage.expectTextVisible(text)

      await page.waitForTimeout(65_000)
      await notePage.open(link)
      await notePage.expectDeletedOrNotFound()
    },
  )

  // Self-destruct check: verifies a default one-view note disappears after one read.
  test('deletes a one-view note after it is read', { tag: ['@regression', '@one-view'] }, async ({
    createNotePage,
    notePage,
  }) => {
    const text = uniqueSecret('one-view-delete')

    const link = await createNotePage.createTextNote(text)
    await notePage.openAndReveal(link)
    await notePage.expectTextVisible(text)

    await notePage.open(link)
    await notePage.expectDeletedOrNotFound()
  })

  // Non-persistence check: verifies a one-view note is gone after it has been read.
  test(
    'does not persist a one-view note after it is read',
    { tag: ['@regression', '@one-view'] },
    async ({ createNotePage, notePage, page }) => {
      const text = uniqueSecret('does-not-persist')

      const link = await createNotePage.createTextNote(text)
      await notePage.openAndReveal(link)
      await notePage.expectTextVisible(text)

      // Reloading the consumed share link should show the deleted/not-found state.
      await page.reload()
      await notePage.expectDeletedOrNotFound()
    },
  )
})
