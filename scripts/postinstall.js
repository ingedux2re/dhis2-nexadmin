#!/usr/bin/env node
// scripts/postinstall.js
// Patches node_modules/@dhis2/cli-app-scripts/src/lib/i18n/generate.js
// to deduplicate the `langs` array — the root cause of the duplicate
// `enTranslations` import when both en.po and en.pot are present.

const fs   = require('fs')
const path = require('path')

// ── 1. stub for multi-calendar-dates (existing) ──────────────────────────────
const stubPath = path.join(
  __dirname, '..', 'node_modules',
  '@dhis2/multi-calendar-dates/src/react-app-env.d.ts'
)
if (!fs.existsSync(stubPath)) {
  fs.mkdirSync(path.dirname(stubPath), { recursive: true })
  fs.writeFileSync(stubPath, '// stub\n')
  console.log('postinstall: created multi-calendar-dates stub')
}

// ── 2. patch proxy.js — strip SameSite cookie attribute ──────────────────────
// DHIS2 2.40+ sets SameSite=Lax on JSESSIONID. The dev proxy redirects from
// localhost:3000 → localhost:8080, causing the browser to drop the cookie.
// Stripping SameSite keeps the session alive (same fix already applied to Secure).
const proxyPath = path.join(
  __dirname, '..', 'node_modules',
  '@dhis2/cli-app-scripts/src/lib/proxy.js'
)

if (fs.existsSync(proxyPath)) {
  let proxySrc = fs.readFileSync(proxyPath, 'utf8')
  const PROXY_ORIGINAL = `filter((v) => v.trim().toLowerCase() !== 'secure')`
  const PROXY_PATCHED  = `filter((v) => { const p = v.trim().toLowerCase(); return p !== 'secure' && !p.startsWith('samesite') })`
  if (proxySrc.includes(PROXY_PATCHED)) {
    console.log('postinstall: proxy.js already patched — nothing to do')
  } else if (proxySrc.includes(PROXY_ORIGINAL)) {
    proxySrc = proxySrc.replace(PROXY_ORIGINAL, PROXY_PATCHED)
    fs.writeFileSync(proxyPath, proxySrc, 'utf8')
    console.log('postinstall: patched proxy.js — SameSite stripped from cookies ✓')
  } else {
    console.warn('postinstall: WARNING — expected line not found in proxy.js, check manually')
  }
} else {
  console.warn('postinstall: proxy.js not found — skipping patch')
}

// ── 3. patch generate.js — deduplicate langs array ────────────────────────────
const genPath = path.join(
  __dirname, '..', 'node_modules',
  '@dhis2/cli-app-scripts/src/lib/i18n/generate.js'
)

if (!fs.existsSync(genPath)) {
  console.warn('postinstall: generate.js not found — skipping patch')
  process.exit(0)
}

let src = fs.readFileSync(genPath, 'utf8')

const ORIGINAL = `const langs = files.map((f) => path.basename(f, path.extname(f)))`
const PATCHED  = `const langs = [...new Set(files.map((f) => path.basename(f, path.extname(f))))]`

if (src.includes(PATCHED)) {
  console.log('postinstall: generate.js already patched — nothing to do')
} else if (src.includes(ORIGINAL)) {
  src = src.replace(ORIGINAL, PATCHED)
  fs.writeFileSync(genPath, src, 'utf8')
  console.log('postinstall: patched generate.js — langs array is now deduplicated ✓')
} else {
  console.warn('postinstall: WARNING — expected line not found in generate.js')
  console.warn('  The upstream source may have changed. Check manually:')
  console.warn('  ' + genPath)
}
