import { HISTORY_LIMIT } from './dice.js'

export const STORAGE_KEY = 'dice-generator-phase3'

export const DEFAULT_FACE_COLOR = '#f4efe4'
export const DEFAULT_MARK_COLOR = '#1c1915'

function defaultState() {
  return {
    faceColor: DEFAULT_FACE_COLOR,
    markColor: DEFAULT_MARK_COLOR,
    history: [],
  }
}

function parseStored(raw) {
  if (!raw) return defaultState()
  try {
    const data = JSON.parse(raw)
    const history = Array.isArray(data.history) ? data.history.slice(0, HISTORY_LIMIT) : []
    return {
      faceColor: typeof data.faceColor === 'string' ? data.faceColor : DEFAULT_FACE_COLOR,
      markColor: typeof data.markColor === 'string' ? data.markColor : DEFAULT_MARK_COLOR,
      history,
    }
  } catch {
    return defaultState()
  }
}

export function loadPersistedState() {
  if (typeof localStorage === 'undefined') return defaultState()
  return parseStored(localStorage.getItem(STORAGE_KEY))
}

export function savePersistedState(state) {
  if (typeof localStorage === 'undefined') return
  const payload = {
    faceColor: state.faceColor ?? DEFAULT_FACE_COLOR,
    markColor: state.markColor ?? DEFAULT_MARK_COLOR,
    history: (state.history ?? []).slice(0, HISTORY_LIMIT),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function prependHistory(history, entry) {
  return [entry, ...history].slice(0, HISTORY_LIMIT)
}