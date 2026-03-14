// src/env.d.ts
declare const process: {
  env: {
    readonly NODE_ENV: 'development' | 'production' | 'test'
  }
}
