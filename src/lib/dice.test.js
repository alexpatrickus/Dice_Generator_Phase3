import { describe, expect, it } from 'vitest'
import { scrambleTotalsForRoll } from './useScrambleTotals.js'
import {
  DIE_TYPES,
  MAX_DICE_PER_TYPE,
  clampCount,
  clampModifier,
  applyD20Advantage,
  formatDieBreakdown,
  formatRollNotation,
  isTwoD20Only,
  rollDie,
  rollSelection,
  rollValueTone,
} from './dice.js'

describe('rollDie', () => {
  it('returns 1 when the random source is 0', () => {
    for (const sides of DIE_TYPES) {
      expect(rollDie(sides, () => 0)).toBe(1)
    }
  })

  it('returns the number of sides when the random source is just under 1', () => {
    for (const sides of DIE_TYPES) {
      expect(rollDie(sides, () => 0.999999)).toBe(sides)
    }
  })

  it('stays inside 1 through the number of sides', () => {
    for (const sides of DIE_TYPES) {
      for (let index = 0; index < 200; index += 1) {
        const value = rollDie(sides)
        expect(value).toBeGreaterThanOrEqual(1)
        expect(value).toBeLessThanOrEqual(sides)
        expect(Number.isInteger(value)).toBe(true)
      }
    }
  })

  it('rejects an unsupported die', () => {
    expect(() => rollDie(7)).toThrow(/Unsupported die/)
  })
})

describe('scrambleTotalsForRoll', () => {
  it('stays within bounds for one D6', () => {
    const roll = rollSelection({ 6: 1, 4: 0, 8: 0, 10: 0, 12: 0, 20: 0 })
    const { total, sums } = scrambleTotalsForRoll(roll)
    expect(sums[6]).toBeGreaterThanOrEqual(1)
    expect(sums[6]).toBeLessThanOrEqual(6)
    expect(total).toBe(sums[6])
  })
})

describe('isTwoD20Only', () => {
  it('is true only for exactly two D20', () => {
    expect(isTwoD20Only({ 20: 2, 4: 0, 6: 0, 8: 0, 10: 0, 12: 0 })).toBe(true)
    expect(isTwoD20Only({ 20: 2, 6: 1, 4: 0, 8: 0, 10: 0, 12: 0 })).toBe(false)
    expect(isTwoD20Only({ 20: 1, 4: 0, 6: 0, 8: 0, 10: 0, 12: 0 })).toBe(false)
  })
})

describe('applyD20Advantage', () => {
  it('keeps the higher D20 total on advantage', () => {
    const roll = rollSelection({ 20: 2, 4: 0, 6: 0, 8: 0, 10: 0, 12: 0 }, {
      random: (() => {
        let i = 0
        const vals = [0.05, 0.95]
        return () => vals[i++]
      })(),
    })
    const next = applyD20Advantage(roll, 'advantage')
    expect(next.dice).toHaveLength(2)
    expect(next.total).toBe(next.dice.find((d) => d.advantageOutcome === 'kept').value)
    expect(next.advantage).toBe('advantage')
    const kept = next.dice.find((d) => d.advantageOutcome === 'kept')
    const dropped = next.dice.find((d) => d.advantageOutcome === 'dropped')
    expect(kept.value).toBeGreaterThan(dropped.value)
  })

  it('keeps the lower D20 total on disadvantage', () => {
    const roll = rollSelection({ 20: 2, 4: 0, 6: 0, 8: 0, 10: 0, 12: 0 }, {
      random: (() => {
        let i = 0
        const vals = [0.05, 0.95]
        return () => vals[i++]
      })(),
    })
    const next = applyD20Advantage(roll, 'disadvantage')
    const kept = next.dice.find((d) => d.advantageOutcome === 'kept')
    const dropped = next.dice.find((d) => d.advantageOutcome === 'dropped')
    expect(kept.value).toBeLessThan(dropped.value)
  })
})

describe('formatRollNotation', () => {
  it('lists each pool with optional modifiers', () => {
    expect(formatRollNotation({ 6: 2, 20: 1 }, { 6: 3, 20: 0 })).toBe('2d6+3 + 1d20')
    expect(formatRollNotation({ 4: 0, 6: 0, 8: 0, 10: 0, 12: 0, 20: 0 })).toBe('—')
  })
})

describe('formatDieBreakdown', () => {
  it('shows natural plus modifier when a modifier is set', () => {
    expect(formatDieBreakdown({ value: 7, natural: 3, modifier: 4 })).toBe('3 + 4')
    expect(formatDieBreakdown({ value: 2, natural: 5, modifier: -3 })).toBe('5 − 3')
    expect(formatDieBreakdown({ value: 6, natural: 6, modifier: 0 })).toBe('6')
  })
})

describe('rollValueTone', () => {
  it('marks the lowest tenth of the range red and top tenth green', () => {
    expect(rollValueTone(1, 20)).toBe('low')
    expect(rollValueTone(2, 20)).toBe('low')
    expect(rollValueTone(3, 20)).toBe('mid')
    expect(rollValueTone(18, 20)).toBe('high')
    expect(rollValueTone(19, 20)).toBe('high')
    expect(rollValueTone(20, 20)).toBe('high')
    expect(rollValueTone(1, 6)).toBe('low')
    expect(rollValueTone(1, 4)).toBe('low')
    expect(rollValueTone(4, 6)).toBe('mid')
    expect(rollValueTone(6, 6)).toBe('high')
  })
})

describe('rollSelection', () => {
  it('sums each type and the grand total', () => {
    const values = [3, 1, 6, 8, 10, 12, 20]
    let cursor = 0
    const roll = rollSelection(
      { 4: 2, 6: 1, 8: 1, 10: 1, 12: 1, 20: 1 },
      {
        random: () => values[cursor++] / 100,
        now: () => 1_700_000_000_000,
        id: (() => {
          let n = 0
          return () => `id-${++n}`
        })(),
      },
    )

    expect(roll.dice.map((die) => [die.sides, die.value])).toEqual([
      [4, 1],
      [4, 1],
      [6, 1],
      [8, 1],
      [10, 2],
      [12, 2],
      [20, 5],
    ])
    expect(roll.sums).toEqual({ 4: 2, 6: 1, 8: 1, 10: 2, 12: 2, 20: 5 })
    expect(roll.total).toBe(13)
  })

  it('returns an empty roll when every count is zero', () => {
    const roll = rollSelection({ 4: 0, 6: 0, 8: 0, 10: 0, 12: 0, 20: 0 }, { now: () => 0 })
    expect(roll.dice).toEqual([])
    expect(roll.total).toBe(0)
  })

  it('adds each row modifier to every die of that type', () => {
    const roll = rollSelection(
      { 6: 2, 20: 0, 4: 0, 8: 0, 10: 0, 12: 0 },
      { modifiers: { 6: 3, 20: 0, 4: 0, 8: 0, 10: 0, 12: 0 }, random: () => 0 },
    )
    expect(roll.dice).toEqual([
      expect.objectContaining({ sides: 6, natural: 1, modifier: 3, value: 4 }),
      expect.objectContaining({ sides: 6, natural: 1, modifier: 3, value: 4 }),
    ])
    expect(roll.sums[6]).toBe(8)
    expect(roll.total).toBe(8)
    expect(clampModifier(25)).toBe(20)
    expect(clampModifier(-21)).toBe(-20)
  })

  it('caps each type at 20 dice', () => {
    const roll = rollSelection({ 6: 25, 20: -3, 4: 2.9 }, { random: () => 0 })
    expect(roll.dice.filter((die) => die.sides === 6)).toHaveLength(MAX_DICE_PER_TYPE)
    expect(roll.dice.filter((die) => die.sides === 20)).toHaveLength(0)
    expect(roll.dice.filter((die) => die.sides === 4)).toHaveLength(2)
    expect(clampCount(Number.NaN)).toBe(0)
  })
})