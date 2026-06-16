import { expect, type Locator, type Page } from '@playwright/test'

type TextNoteOptions = {
  expirationMinutes?: number
  password?: string
}

type PasswordProtectedTextNote = {
  password: string
  text: string
}

type ExpiringTextNote = {
  expirationMinutes: number
  text: string
}

// Page object for the Cryptgeon create-note screen.
export class CreateNotePage {
  readonly page: Page
  readonly noteInput: Locator
  readonly createButton: Locator
  readonly shareLinkInput: Locator
  readonly advancedSwitch: Locator
  readonly expirationModeSwitch: Locator
  readonly expirationInput: Locator
  readonly customPasswordSwitch: Locator
  readonly passwordInput: Locator

  // Initializes the page object with the browser page and create-note locators.
  constructor(page: Page) {
    this.page = page
    this.noteInput = page.getByTestId('text-field')
    this.createButton = page.getByRole('button', { name: /create/i })
    this.shareLinkInput = page.getByTestId('share-link')
    this.advancedSwitch = page.getByTestId('switch-advanced')
    this.expirationModeSwitch = page.getByTestId('switch-advanced-toggle')
    this.expirationInput = page.getByTestId('field-expiration')
    this.customPasswordSwitch = page.getByTestId('custom-password')
    this.passwordInput = page.getByTestId('password')
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

  // Creates a text note with optional advanced settings and returns the generated share link.
  async createTextNote(text: string, options: TextNoteOptions = {}) {
    await this.goto()
    await this.noteInput.fill(text)

    if (options.expirationMinutes || options.password) {
      await this.advancedSwitch.click()
    }

    if (options.expirationMinutes) {
      await this.expirationModeSwitch.click()
      await this.expirationInput.fill(String(options.expirationMinutes))
    }

    if (options.password) {
      await this.customPasswordSwitch.click()
      await this.passwordInput.fill(options.password)
    }

    await this.createButton.click()
    await expect(this.shareLinkInput).toBeVisible()

    return this.shareLinkInput.inputValue()
  }

  async createPasswordProtectedTextNote(note: PasswordProtectedTextNote) {
    return this.createTextNote(note.text, { password: note.password })
  }

  async createExpiringTextNote(note: ExpiringTextNote) {
    return this.createTextNote(note.text, { expirationMinutes: note.expirationMinutes })
  }
}
