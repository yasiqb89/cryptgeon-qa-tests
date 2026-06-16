// Builds unique note text so test runs do not accidentally reuse old data.
export function uniqueSecret(label: string) {
  const timestamp = new Date().toISOString()
  const randomSuffix = Math.random().toString(36).slice(2)

  return `cryptgeon qa ${label} ${timestamp} ${randomSuffix}`
}
