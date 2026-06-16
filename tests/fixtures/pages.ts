import { test as base } from '@playwright/test'
import { CreateNotePage } from '../../pages/CreateNotePage'
import { NotePage } from '../../pages/NotePage'

type PageFixtures = {
  createNotePage: CreateNotePage
  notePage: NotePage
}

export const test = base.extend<PageFixtures>({
  createNotePage: async ({ page }, use) => {
    await use(new CreateNotePage(page))
  },
  notePage: async ({ page }, use) => {
    await use(new NotePage(page))
  },
})

export { expect } from '@playwright/test'
