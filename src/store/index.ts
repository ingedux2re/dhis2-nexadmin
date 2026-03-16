// ─────────────────────────────────────────────────────────────────────────────
// src/store/index.ts
// DHIS2 NexAdmin — Zustand global store (UI state only — no server data)
//
// Server data lives in @dhis2/app-runtime query cache.
// This store holds: locale, sidebar open state, global loading overlay.
//
// NOTE: "activePage" was removed — the active route is already derived
// from react-router's useLocation() in the Sidebar, keeping a single
// source of truth and avoiding router/store drift.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { AppState } from '../types'

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // ── Locale ─────────────────────────────────────────────────────────────
      currentLocale: 'en',
      setLocale: (locale: string) => set({ currentLocale: locale }, false, 'setLocale'),

      // ── Global loading overlay ──────────────────────────────────────────────
      globalLoading: false,
      setGlobalLoading: (loading: boolean) =>
        set({ globalLoading: loading }, false, 'setGlobalLoading'),

      // ── Sidebar (mobile toggle) ─────────────────────────────────────────────
      sidebarOpen: true,
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }, false, 'setSidebarOpen'),
    }),
    {
      name: 'nexadmin-store', // appears in Redux DevTools
      enabled: process.env.NODE_ENV === 'development',
    }
  )
)

// ── Selector hooks (memoized for performance) ─────────────────────────────────

export const useLocaleStore = () => useAppStore((s) => s.currentLocale)
export const useSidebarStore = () => useAppStore((s) => s.sidebarOpen)
