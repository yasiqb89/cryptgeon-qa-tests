import { test } from '@playwright/test'
import { CreateNotePage } from '../pages/CreateNotePage'

test.describe('Cryptgeon smoke checks', () => {
  // Smoke check: confirms the deployed app is reachable and the create form renders.
  test('loads the create note page', async ({ page }) => {
    const createNotePage = new CreateNotePage(page)

    await createNotePage.goto()
    await createNotePage.expectLoaded()
  })
})
