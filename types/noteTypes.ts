export type TextNoteOptions = {
  expirationMinutes?: number
  password?: string
}

export type PasswordProtectedTextNote = {
  password: string
  text: string
}

export type ExpiringTextNote = {
  expirationMinutes: number
  text: string
}

export type PasswordProtectedNote = {
  link: string
  password: string
}

export type CreatedPasswordProtectedNote = PasswordProtectedNote

export type GeneratedPasswordProtectedTextNote = {
  text: string
}
