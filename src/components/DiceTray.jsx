import {
  DIE_TYPES,
  MAX_DICE_PER_TYPE,
  MAX_MODIFIER,
  formatDieBreakdown,
  formatModifier,
  totalDice,
} from '../lib/dice.js'
import { DiceFace } from './DiceFace.jsx'

export function DiceTray({
  counts,
  modifiers,
  roll,
  animating = false,
  faceColor,
  markColor,
  onCount,
  onModifier,
  onRollOne,
  onRoll,
  onReset,
}) {
  const facesRevealed = !animating
  const selected = totalDice(counts)

  return (
    <section className="panel tray-panel" aria-labelledby="tray-heading">
      <div className="panel__head tray-panel__head tray-panel__head--grid">
        <div className="tray__head-controls">
          <h2 id="tray-heading">Dice</h2>
          <span className="tray__col-label tray__col-label--modifier">Modifier</span>
          <span className="tray__col-label tray__col-label--number">Number</span>
        </div>
        <span className="tray__col-spacer" aria-hidden="true" />
        {roll ? (
          <p className="tray-panel__total" aria-label={`Grand total ${roll.total}`}>
            Total <strong>{roll.total}</strong>
          </p>
        ) : (
          <p className="tray-panel__hint muted">Result</p>
        )}
      </div>
      <ul className="tray">
        {DIE_TYPES.map((sides) => {
          const count = counts[sides] ?? 0
          const modifier = modifiers[sides] ?? 0
          const rolledDice = roll?.dice.filter((die) => die.sides === sides) ?? []
          const rolledCount = rolledDice.length
          const rolledSum = roll?.sums[sides] ?? 0
          const rollDetailText = rolledDice.map((die) => formatDieBreakdown(die)).join(', ')

          return (
            <li key={sides} className="tray__row">
              <div className="tray__row-controls">
                <div className="tray__die-cell">
                  <button
                    type="button"
                    className={`die-roll die-roll--d${sides}`}
                    aria-label={`Roll D${sides}`}
                    disabled={animating}
                    onClick={() => onRollOne(sides)}
                  >
                    <span className="die-roll__shape">
                      <span className="die-roll__label">D{sides}</span>
                    </span>
                  </button>
                </div>
                <div className="stepper stepper--modifier" aria-label={`Modifier for D${sides}`}>
                  <button
                    type="button"
                    className="stepper__triangle stepper__triangle--left"
                    aria-label={`Decrease D${sides} modifier`}
                    disabled={modifier <= -MAX_MODIFIER}
                    onClick={() => onModifier(sides, modifier - 1)}
                  >
                    <span className="sr-only">Decrease modifier</span>
                  </button>
                  <span aria-live="polite">{formatModifier(modifier)}</span>
                  <button
                    type="button"
                    className="stepper__triangle stepper__triangle--right"
                    aria-label={`Increase D${sides} modifier`}
                    disabled={modifier >= MAX_MODIFIER}
                    onClick={() => onModifier(sides, modifier + 1)}
                  >
                    <span className="sr-only">Increase modifier</span>
                  </button>
                </div>
                <div className="stepper stepper--count">
                  <button
                    type="button"
                    aria-label={`Remove one D${sides}`}
                    disabled={count === 0}
                    onClick={() => onCount(sides, count - 1)}
                  >
                    −
                  </button>
                  <span aria-live="polite" aria-label={`${count} D${sides}`}>
                    {count}
                  </span>
                  <button
                    type="button"
                    aria-label={`Add one D${sides}`}
                    disabled={count >= MAX_DICE_PER_TYPE}
                    onClick={() => onCount(sides, count + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div
                className={`tray__row-result${rolledCount > 0 ? ' tray__row-result--interactive' : ''}`}
                aria-live="polite"
                tabIndex={rolledCount > 0 ? 0 : undefined}
                aria-label={
                  rolledCount > 0
                    ? `${rolledCount}d${sides} total ${rolledSum}. Individual rolls: ${rollDetailText}`
                    : undefined
                }
              >
                {roll && rolledCount > 0 ? (
                  <>
                    <span className="tray__row-result__notation">
                      {rolledCount}d{sides}
                    </span>
                    <strong className="tray__row-result__total">{rolledSum}</strong>
                    <p className="tray__row-popover" role="tooltip">
                      {rolledDice.map((die) => (
                        <span key={die.id}>{formatDieBreakdown(die)}</span>
                      ))}
                    </p>
                  </>
                ) : (
                  <span className="tray__row-result--empty" aria-hidden="true">
                    —
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      <div className="tray__actions">
        <button
          type="button"
          className="button button--roll"
          disabled={selected === 0 || animating}
          onClick={onRoll}
        >
          {selected === 0
            ? 'Select dice to roll'
            : `Roll ${selected} Selected ${selected === 1 ? 'Die' : 'Dice'}`}
        </button>
        <button
          type="button"
          className="button button--reset"
          disabled={selected === 0 && !roll}
          onClick={onReset}
        >
          Reset selection
        </button>
      </div>
      {roll && roll.dice.length > 0 ? (
        <ul className="faces tray__faces" aria-label="Individual dice results">
          {roll.dice.map((die) => (
            <li key={die.id}>
              <DiceFace
                sides={die.sides}
                value={die.value}
                natural={die.natural}
                modifier={die.modifier}
                faceColor={faceColor}
                markColor={markColor}
                animating={animating}
                revealed={facesRevealed}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}