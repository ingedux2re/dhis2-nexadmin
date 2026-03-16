// ─────────────────────────────────────────────────────────────────────────────
// src/utils/nanoid.ts
// Tiny collision-resistant id generator — no external dependency needed.
// ─────────────────────────────────────────────────────────────────────────────

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function nanoid(size = 10): string {
  let id = ''
  for (let i = 0; i < size; i++) {
    id += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return id
}
