// Optional create-note settings shared by page objects and tests.
export type TextNoteOptions = {
  expirationMinutes?: number
  password?: string
}

// Input for creating a note protected by a user-provided password.
export type PasswordProtectedTextNote = {
  password: string
  text: string
}

// Input for creating a note that expires after a time window.
export type ExpiringTextNote = {
  expirationMinutes: number
  text: string
}

// Information needed by a recipient to open a password-protected note.
export type PasswordProtectedNote = {
  link: string
  password: string
}

export type CreatedPasswordProtectedNote = PasswordProtectedNote

// Input for creating a note that uses Cryptgeon's generated password control.
export type GeneratedPasswordProtectedTextNote = {
  text: string
}
