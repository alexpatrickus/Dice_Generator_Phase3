import { useEffect, useState } from 'react'
import { DIE_TYPES } from './dice.js'

function randomInt(min, max) {
  const lo = Math.min(min, max)
  const hi = Math.max(min, max)
  if (hi <= lo) return lo
  return Math.floor(Math.random() * (hi - lo + 1)) + lo
}

/** Random totals in valid ranges for the dice in this roll. */
export function scrambleTotalsForRoll(roll) {
  if (!roll?.dice?.length) {
    return { total: 0, sums: Object.fromEntries(DIE_TYPES.map((sides) => [sides, 0])) }
  }

  const sums = Object.fromEntries(DIE_TYPES.map((sides) => [sides, 0]))

  for (const sides of DIE_TYPES) {
    const dice = roll.dice.filter((die) => die.sides === sides)
    if (dice.length === 0) continue

    const modifier = dice[0].modifier ?? 0
    const dieMin = 1 + modifier
    const dieMax = sides + modifier

    if (roll.advantage && sides === 20) {
      sums[sides] = randomInt(dieMin, dieMax)
      continue
    }

    const count = dice.length
    sums[sides] = randomInt(count * dieMin, count * dieMax)
  }

  const total = roll.advantage ? sums[20] : DIE_TYPES.reduce((sum, sides) => sum + sums[sides], 0)
  return { total, sums }
}

export function useScrambleTotals(roll, animating) {
  const [scramble, setScramble] = useState(null)

  useEffect(() => {
    if (!animating || !roll) {
      setScramble(null)
      return undefined
    }

    const tick = () => setScramble(scrambleTotalsForRoll(roll))
    tick()
    const intervalId = window.setInterval(tick, 75)
    return () => window.clearInterval(intervalId)
  }, [animating, roll])

  if (!roll) {
    return { total: 0, sums: Object.fromEntries(DIE_TYPES.map((sides) => [sides, 0])) }
  }

  if (animating && scramble) {
    return scramble
  }

  return { total: roll.total, sums: roll.sums }
}