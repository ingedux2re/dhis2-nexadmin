// ─────────────────────────────────────────────────────────────────────────────
// src/store/__tests__/store.test.ts
// Unit tests for Zustand store — Phase 0
// ─────────────────────────────────────────────────────────────────────────────

import { act, renderHook } from '@testing-library/react'
import { useAppStore } from '../index'

// Reset store between tests
beforeEach(() => {
  useAppStore.setState({
    currentLocale: 'en',
    globalLoading: false,
    sidebarOpen: false,
    activePage: 'dashboard',
  })
})

describe('useAppStore', () => {
  it('has correct initial state', () => {
    const { result } = renderHook(() => useAppStore())
    expect(result.current.currentLocale).toBe('en')
    expect(result.current.globalLoading).toBe(false)
    expect(result.current.sidebarOpen).toBe(false)
    expect(result.current.activePage).toBe('dashboard')
  })

  it('setLocale updates currentLocale', () => {
    const { result } = renderHook(() => useAppStore())
    act(() => result.current.setLocale('fr'))
    expect(result.current.currentLocale).toBe('fr')
  })

  it('setGlobalLoading toggles loading flag', () => {
    const { result } = renderHook(() => useAppStore())
    act(() => result.current.setGlobalLoading(true))
    expect(result.current.globalLoading).toBe(true)
    act(() => result.current.setGlobalLoading(false))
    expect(result.current.globalLoading).toBe(false)
  })

  it('setSidebarOpen toggles sidebar', () => {
    const { result } = renderHook(() => useAppStore())
    act(() => result.current.setSidebarOpen(true))
    expect(result.current.sidebarOpen).toBe(true)
  })

  it('setActivePage changes the active page', () => {
    const { result } = renderHook(() => useAppStore())
    act(() => result.current.setActivePage('f3-duplicate-detector'))
    expect(result.current.activePage).toBe('f3-duplicate-detector')
  })
})
