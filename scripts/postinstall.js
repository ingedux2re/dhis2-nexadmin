#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const stubs = [
  'node_modules/@dhis2/multi-calendar-dates/src/react-app-env.d.ts',
]

const root = path.resolve(__dirname, '..')
let fixed = 0

for (const stub of stubs) {
  const filePath = path.join(root, stub)
  const dir = path.dirname(filePath)
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(filePath, '// stub — auto-created by scripts/postinstall.js\n')
    console.log(`✅  Created: ${stub}`)
    fixed++
  }
}

if (fixed === 0) console.log('✅  postinstall: stubs already in place')
