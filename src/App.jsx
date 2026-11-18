import { useCallback, useEffect, useState } from 'react'
import { DiceTray } from './components/DiceTray.jsx'
import { ColorControls } from './components/ColorControls.jsx'
import { History } from './components/History.jsx'
import {
  EMPTY_COUNTS,
  EMPTY_MODIFIERS,
  ROLL_ANIMATION_MS,
  clampCount,
  applyD20Advantage,
  clampModifier,
  formatRollNotation,
  isTwoD20Only,
  rollSelection,
  singleTypeCounts,
} from './lib/dice.js'
import {
  loadPersistedState,
  prependHistory,
  savePersistedState,
} from './lib/storage.js'
import { useReducedMotion } from './lib/useReducedMotion.js'

export default function App() {
  const reducedMotion = useReducedMotion()
  const [persisted, setPersisted] = useState(() => loadPersistedState())
  const [counts, setCounts] = useState(EMPTY_COUNTS)
  const [modifiers, setModifiers] = useState(EMPTY_MODIFIERS)
  const [roll, setRoll] = useState(null)
  const [animating, setAnimating] = useState(false)

  const { faceColor, markColor, history } = persisted

  useEffect(() => {
    savePersistedState(persisted)
  }, [persisted])

  const commitRoll = useCallback(
    (nextRoll, selectionCounts, selectionModifiers, options = {}) => {
      const { notation: notationOverride, historyDice } = options
      const notation = notationOverride ?? formatRollNotation(selectionCounts, selectionModifiers)
      const historyEntry = {
        id: nextRoll.id,
        timestamp: nextRoll.timestamp,
        total: nextRoll.total,
        notation,
        dice: historyDice ?? nextRoll.allDice ?? nextRoll.dice,
      }

      setRoll(nextRoll)
      setPersisted((current) => ({
        ...current,
        history: prependHistory(current.history, historyEntry),
      }))

      if (reducedMotion || nextRoll.dice.length === 0) {
        setAnimating(false)
        return
      }
      setAnimating(true)
      window.setTimeout(() => setAnimating(false), ROLL_ANIMATION_MS)
    },
    [reducedMotion],
  )

  function startRoll(nextCounts, selectionModifiers = modifiers) {
    commitRoll(rollSelection(nextCounts, { modifiers: selectionModifiers }), nextCounts, selectionModifiers)
  }

  function rollOne(sides) {
    const nextCounts = singleTypeCounts(sides)
    setCounts(nextCounts)
    startRoll(nextCounts)
  }

  function rollSelected() {
    startRoll(counts)
  }

  function rollSelectedD20Advantage(mode) {
    if (!isTwoD20Only(counts)) return
    const raw = rollSelection(counts, { modifiers })
    const nextRoll = applyD20Advantage(raw, mode)
    const suffix = mode === 'advantage' ? ' (advantage)' : ' (disadvantage)'
    commitRoll(nextRoll, counts, modifiers, {
      notation: `${formatRollNotation(counts, modifiers)}${suffix}`,
      historyDice: nextRoll.dice,
    })
  }

  function setCount(sides, count) {
    const next = clampCount(count)
    setCounts((current) => ({ ...current, [sides]: next }))
    if (next === 0) {
      setModifiers((current) => ({ ...current, [sides]: 0 }))
    }
  }

  function resetCounts() {
    setCounts(EMPTY_COUNTS)
    setModifiers(EMPTY_MODIFIERS)
    setRoll(null)
    setAnimating(false)
  }

  function setModifier(sides, modifier) {
    const next = clampModifier(modifier)
    setModifiers((current) => ({ ...current, [sides]: next }))
    if (next !== 0) {
      setCounts((current) => {
        if (clampCount(current[sides] ?? 0) === 0) {
          return { ...current, [sides]: 1 }
        }
        return current
      })
    }
  }

  function setFaceColor(next) {
    setPersisted((current) => ({ ...current, faceColor: next }))
  }

  function setMarkColor(next) {
    setPersisted((current) => ({ ...current, markColor: next }))
  }

  function clearHistory() {
    setPersisted((current) => ({ ...current, history: [] }))
  }

  return (
    <div className="app">
      <header className="masthead">
        <p className="eyebrow">Table dice · Phase 3</p>
        <h1>Dice Generator</h1>
        <p>Roll with animation, custom face colors, and a saved history of your last 20 rolls.</p>
      </header>
      <main className="layout layout--split">
        <DiceTray
          counts={counts}
          modifiers={modifiers}
          roll={roll}
          animating={animating}
          faceColor={faceColor}
          markColor={markColor}
          onCount={setCount}
          onModifier={setModifier}
          onRollOne={rollOne}
          onRoll={rollSelected}
          onRollAdvantage={() => rollSelectedD20Advantage('advantage')}
          onRollDisadvantage={() => rollSelectedD20Advantage('disadvantage')}
          onReset={resetCounts}
        />
        <aside className="sidebar" aria-label="Appearance and history">
          <ColorControls
            faceColor={faceColor}
            markColor={markColor}
            onFaceColor={setFaceColor}
            onMarkColor={setMarkColor}
          />
          <History history={history} onClear={clearHistory} />
        </aside>
      </main>
    </div>
  )
}