import { describe, expect, it, beforeEach, vi } from 'vitest'
import { HISTORY_LIMIT } from './dice.js'
import {
  DEFAULT_FACE_COLOR,
  STORAGE_KEY,
  loadPersistedState,
  prependHistory,
  savePersistedState,
} from './storage.js'

function installLocalStorage() {
  const store = {}
  vi.stubGlobal('localStorage', {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value)
    },
    clear: () => {
      for (const key of Object.keys(store)) delete store[key]
    },
  })
}

describe('storage', () => {
  beforeEach(() => {
    installLocalStorage()
    localStorage.clear()
  })

  it('returns defaults when nothing is stored', () => {
    const state = loadPersistedState()
    expect(state.faceColor).toBe(DEFAULT_FACE_COLOR)
    expect(state.history).toEqual([])
  })

  it('round-trips colors and history', () => {
    savePersistedState({
      faceColor: '#abcdef',
      markColor: '#123456',
      history: [{ id: 'a', total: 12 }],
    })
    const loaded = loadPersistedState()
    expect(loaded.faceColor).toBe('#abcdef')
    expect(loaded.markColor).toBe('#123456')
    expect(loaded.history).toHaveLength(1)
    expect(localStorage.getItem(STORAGE_KEY)).toContain('abcdef')
  })

  it('caps history at HISTORY_LIMIT', () => {
    const base = Array.from({ length: HISTORY_LIMIT + 5 }, (_, i) => ({ id: String(i) }))
    const next = prependHistory([], { id: 'new' })
    const merged = prependHistory(base, { id: 'new' })
    expect(next).toHaveLength(1)
    expect(merged).toHaveLength(HISTORY_LIMIT)
    expect(merged[0].id).toBe('new')
  })
})