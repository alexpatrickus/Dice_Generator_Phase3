import { formatDieBreakdown, rollValueTone } from '../lib/dice.js'

export function DiceFace({
  sides,
  value,
  natural,
  modifier = 0,
  faceColor,
  markColor,
  animating = false,
  revealed = true,
}) {
  const die = { sides, value, natural: natural ?? value, modifier }
  const display = formatDieBreakdown(die)
  const showBreakdown = modifier !== 0
  const tone = rollValueTone(value, sides)

  return (
    <div
      className={[
        `die die--d${sides}`,
        animating && 'die--tumbling',
        revealed && 'die--revealed',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        '--die-face-custom': faceColor,
        '--die-mark-custom': markColor,
      }}
      role="img"
      aria-label={
        showBreakdown ? `${display} on a D${sides} (total ${value})` : `${value} on a D${sides}`
      }
    >
      <div className="die__shape">
        <span className="die__type">D{sides}</span>
        <span
          className={[
            'die__value',
            showBreakdown && 'die__value--breakdown',
            !showBreakdown && value >= 10 && 'die__value--wide',
            tone !== 'mid' && `die__value--${tone}`,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        >
          {display}
        </span>
      </div>
    </div>
  )
}