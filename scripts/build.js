#!/usr/bin/env node
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const enPo  = path.join(root, 'i18n', 'en.po')
const enPot = path.join(root, 'i18n', 'en.pot')
const enBak = path.join(root, 'i18n', 'en.po.bak')

const run = (cmd) => { console.log(`\n> ${cmd}`); execSync(cmd, { stdio: 'inherit', cwd: root }) }

if (fs.existsSync(enPo)) fs.renameSync(enPo, enBak)
try { run('yarn d2-app-scripts i18n extract') } catch (_) {}
if (fs.existsSync(enBak)) fs.renameSync(enBak, enPo)
if (fs.existsSync(enPot)) fs.unlinkSync(enPot)
run('yarn d2-app-scripts i18n generate')

const idx = path.join(root, 'src', 'locales', 'index.js')
if (fs.existsSync(idx)) {
  const n = (fs.readFileSync(idx,'utf8').match(/import enTranslations/g)||[]).length
  if (n > 1) { console.error(`[build] ABORT: ${n}x enTranslations`); process.exit(1) }
  console.log('[build] src/locales/index.js clean.')
}

try { run('yarn d2-app-scripts build --no-i18n') }
catch (_) { run('yarn d2-app-scripts build') }
