/* eslint-disable @typescript-eslint/no-var-requires */
const { config } = require('@dhis2/cli-app-scripts')

module.exports = {
  ...config,
  type: 'app',
  name: 'DHIS2 NexAdmin',
  title: 'DHIS2 NexAdmin',
  description: 'IS Administration Toolkit — Org Units, Users, Governance & Analytics',
  minDHIS2Version: '2.38',
  entryPoints: { app: './src/App.tsx' },
  pwa: { enabled: false },
}
