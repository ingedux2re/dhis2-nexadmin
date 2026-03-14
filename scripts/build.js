#!/usr/bin/env node
// scripts/build.js — clean wrapper around d2-app-scripts build
// The langs-deduplication patch in scripts/postinstall.js eliminates
// the duplicate enTranslations import; this file just runs the build.
const { execSync } = require('child_process')
const path = require('path')

const root = path.resolve(__dirname, '..')
const run  = (cmd) => { console.log(`\n> ${cmd}`); execSync(cmd, { stdio: 'inherit', cwd: root }) }

run('yarn d2-app-scripts build')
