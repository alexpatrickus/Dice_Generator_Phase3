export const DIE_TYPES = [4, 6, 8, 10, 12, 20]
export const MAX_DICE_PER_TYPE = 20
export const MAX_MODIFIER = 20
export const HISTORY_LIMIT = 20
export const ROLL_ANIMATION_MS = 600

export const EMPTY_COUNTS = Object.fromEntries(DIE_TYPES.map((sides) => [sides, 0]))
export const EMPTY_MODIFIERS = Object.fromEntries(DIE_TYPES.map((sides) => [sides, 0]))

let sequence = 0

function nextId() {
  sequence += 1
  return `${Date.now().toString(36)}-${sequence}`
}

export function clampCount(count) {
  const value = Number.isFinite(count) ? Math.floor(count) : 0
  return Math.min(MAX_DICE_PER_TYPE, Math.max(0, value))
}

export function clampModifier(modifier) {
  const value = Number.isFinite(modifier) ? Math.floor(modifier) : 0
  return Math.min(MAX_MODIFIER, Math.max(-MAX_MODIFIER, value))
}

export function formatModifier(modifier) {
  const value = clampModifier(modifier)
  if (value > 0) return `+${value}`
  return String(value)
}

export function formatDieBreakdown(die) {
  const natural = die.natural ?? die.value
  const modifier = die.modifier ?? 0
  if (modifier === 0) return String(die.value)
  if (modifier > 0) return `${natural} + ${modifier}`
  return `${natural} − ${Math.abs(modifier)}`
}

export function rollDie(sides, random = Math.random) {
  if (!DIE_TYPES.includes(sides)) {
    throw new Error(`Unsupported die: ${sides}`)
  }
  return Math.floor(random() * sides) + 1
}

const LOWER_DICE_MAX_SIDES = 10

/** @returns {'low' | 'mid' | 'high'} */
export function rollValueTone(value, sides) {
  if (!Number.isFinite(value) || !DIE_TYPES.includes(sides)) return 'mid'
  if (value === 1 && sides <= LOWER_DICE_MAX_SIDES) return 'low'
  const ratio = value / sides
  if (ratio <= 0.1) return 'low'
  if (ratio >= 0.9) return 'high'
  return 'mid'
}

export function singleTypeCounts(sides) {
  return { ...EMPTY_COUNTS, [sides]: 1 }
}

export function totalDice(counts) {
  return DIE_TYPES.reduce((sum, sides) => sum + clampCount(counts?.[sides] ?? 0), 0)
}

/** Human-readable pool notation, e.g. `2d6+3 + 1d20`. */
export function formatRollNotation(counts, modifiers = EMPTY_MODIFIERS) {
  const parts = []
  for (const sides of DIE_TYPES) {
    const count = clampCount(counts?.[sides] ?? 0)
    if (count === 0) continue
    const modifier = clampModifier(modifiers?.[sides] ?? 0)
    let segment = `${count}d${sides}`
    if (modifier !== 0) segment += formatModifier(modifier)
    parts.push(segment)
  }
  return parts.length > 0 ? parts.join(' + ') : '—'
}

export function rollSelection(counts, options = {}) {
  const random = options.random ?? Math.random
  const now = options.now ?? Date.now
  const id = options.id ?? nextId
  const modifiers = options.modifiers ?? EMPTY_MODIFIERS

  const dice = []
  const sums = Object.fromEntries(DIE_TYPES.map((sides) => [sides, 0]))

  for (const sides of DIE_TYPES) {
    const count = clampCount(counts?.[sides] ?? 0)
    const modifier = clampModifier(modifiers?.[sides] ?? 0)
    for (let index = 0; index < count; index += 1) {
      const natural = rollDie(sides, random)
      const value = natural + modifier
      dice.push({ id: id(), sides, natural, modifier, value })
      sums[sides] += value
    }
  }

  const total = dice.reduce((sum, die) => sum + die.value, 0)
  return { id: id(), timestamp: now(), dice, sums, total }
}