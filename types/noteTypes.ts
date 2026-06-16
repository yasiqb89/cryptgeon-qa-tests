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
