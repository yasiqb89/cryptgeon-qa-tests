import { expect, type Locator, type Page } from '@playwright/test'

// Page object for opening and revealing an existing Cryptgeon note.
export class NotePage {
  readonly page: Page
  readonly showNoteButton: Locator
  readonly passwordInput: Locator
  readonly result: Locator
  readonly pageContent: Locator

  // Initializes the page object with the browser page and note-view locators.
  constructor(page: Page) {
    this.page = page
    this.showNoteButton = page.getByTestId('show-note-button')
    this.passwordInput = page.getByTestId('show-note-password')
    this.result = page.getByTestId('result')
    this.pageContent = page.locator('main')
  }

  // Opens a generated Cryptgeon share link.
  async open(link: string) {
    await this.page.goto('/')
    await this.page.goto(link)
  }

  // Clicks the reveal button so Cryptgeon decrypts and displays the note.
  async reveal() {
    await this.showNoteButton.click()
  }

  // Opens a share link and reveals the note content in one flow.
  async openAndReveal(link: string, password?: string) {
    await this.open(link)
    if (password) {
      await this.passwordInput.fill(password)
    }
    await this.reveal()
  }

  // Confirms the decrypted note contains the expected secret text.
  async expectTextVisible(text: string) {
    await expect(this.result).toContainText(text)
  }

  // Confirms the note is no longer available after it has been consumed.
  async expectDeletedOrNotFound() {
    await expect(this.pageContent).toContainText(/note was not found|already deleted/i)
  }
}
