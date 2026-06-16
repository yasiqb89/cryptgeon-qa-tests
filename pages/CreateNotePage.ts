import { expect, type Locator, type Page } from '@playwright/test'

// Page object for the Cryptgeon create-note screen.
export class CreateNotePage {
  readonly page: Page
  readonly noteInput: Locator
  readonly createButton: Locator
  readonly shareLinkInput: Locator

  // Initializes the page object with the browser page and create-note locators.
  constructor(page: Page) {
    this.page = page
    this.noteInput = page.getByTestId('text-field')
    this.createButton = page.getByRole('button', { name: /create/i })
    this.shareLinkInput = page.getByTestId('share-link')
  }

  // Opens the Cryptgeon home page where users create notes.
  async goto() {
    await this.page.goto('/')
  }

  // Verifies the main create-note controls are ready to use.
  async expectLoaded() {
    await expect(this.noteInput).toBeVisible()
    await expect(this.createButton).toBeVisible()
  }

  // Creates a text note and returns the generated share link.
  async createTextNote(text: string) {
    await this.goto()
    await this.noteInput.fill(text)
    await this.createButton.click()
    await expect(this.shareLinkInput).toBeVisible()

    return this.shareLinkInput.inputValue()
  }
}
