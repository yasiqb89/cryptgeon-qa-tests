import { test } from './fixtures/pages'

test.describe('Cryptgeon smoke checks', () => {
  // Smoke check: confirms the deployed app is reachable and the create form renders.
  test('loads the create note page', async ({ createNotePage }) => {
    await createNotePage.goto()
    await createNotePage.expectLoaded()
  })
})
