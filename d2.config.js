/* eslint-disable @typescript-eslint/no-var-requires */
const { config } = require('@dhis2/cli-app-scripts')

module.exports = {
  ...config,
  type: 'app',
  name: 'DHIS2 NexAdmin',
  title: 'DHIS2 NexAdmin',
  description: 'IS Administration Toolkit — Org Units, Users, Governance & Analytics',
  minDHIS2Version: '2.38',

  // Entry point
  entryPoints: {
    app: './src/App.tsx',
  },

  // PWA off for now — enable in Phase 8 (production hardening)
  pwa: {
    enabled: false,
  },

  // Proxy DHIS2 instance for local dev
  // Override via DHIS2_BASE_URL env variable or d2.config.local.js
  proxy: {
    // e.g. https://play.im.dhis2.org/stable-2-41-7
    baseUrl: process.env.DHIS2_BASE_URL || 'http://localhost:8080',
    auth: process.env.DHIS2_AUTH || 'admin:district',
  },
}
