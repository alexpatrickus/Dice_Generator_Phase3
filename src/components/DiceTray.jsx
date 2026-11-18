import {
  DIE_TYPES,
  MAX_DICE_PER_TYPE,
  MAX_MODIFIER,
  formatDieBreakdown,
  formatModifier,
  isTwoD20Only,
  totalDice,
} from '../lib/dice.js'
import { useScrambleTotals } from '../lib/useScrambleTotals.js'
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
  onRollAdvantage,
  onRollDisadvantage,
  onReset,
}) {
  const facesRevealed = !animating
  const selected = totalDice(counts)
  const twoD20Only = isTwoD20Only(counts)
  const displayTotals = useScrambleTotals(roll, animating)

  return (
    <section
      className={`panel tray-panel${animating ? ' tray-panel--rolling' : ''}`}
      aria-labelledby="tray-heading"
      aria-busy={animating}
    >
      <div className="panel__head tray-panel__head tray-panel__head--grid">
        <div className="tray__head-controls">
          <h2 id="tray-heading">Dice</h2>
          <span className="tray__col-label tray__col-label--modifier">Modifier</span>
          <span className="tray__col-label tray__col-label--number">Number</span>
        </div>
        <span className="tray__col-spacer" aria-hidden="true" />
        {roll ? (
          <p
            className="tray-panel__total"
            aria-label={animating ? 'Rolling, total updating' : `Grand total ${roll.total}`}
          >
            Total{' '}
            <strong className={animating ? 'tray-total--scramble' : undefined}>{displayTotals.total}</strong>
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
          const diceForBreakdown = rolledDice
          const rolledCount =
            roll?.advantage && sides === 20 && count > 0 ? count : rolledDice.length
          const rolledSum = displayTotals.sums[sides] ?? 0
          const rollDetailText = diceForBreakdown.map((die) => formatDieBreakdown(die)).join(', ')

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
                  rolledCount > 0 && !animating
                    ? `${rolledCount}d${sides} total ${roll?.sums[sides] ?? 0}${roll?.advantage ? `. Rolls: ${rollDetailText}` : `. Individual rolls: ${rollDetailText}`}`
                    : rolledCount > 0 && animating
                      ? `${rolledCount}d${sides} rolling`
                      : undefined
                }
              >
                {roll && rolledCount > 0 ? (
                  <>
                    <span className="tray__row-result__notation">
                      {rolledCount}d{sides}
                    </span>
                    <strong
                      className={[
                        'tray__row-result__total',
                        animating && 'tray__row-result__total--scramble',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {rolledSum}
                    </strong>
                    <p className="tray__row-popover" role="tooltip">
                      {diceForBreakdown.map((die) => (
                        <span
                          key={die.id}
                          className={
                            die.advantageOutcome === 'kept'
                              ? 'tray__popover-kept'
                              : die.advantageOutcome === 'dropped'
                                ? 'tray__popover-dropped'
                                : undefined
                          }
                        >
                          {formatDieBreakdown(die)}
                          {die.advantageOutcome === 'kept'
                            ? ' (used)'
                            : die.advantageOutcome === 'dropped'
                              ? ' (ignored)'
                              : ''}
                        </span>
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
        {twoD20Only ? (
          <div className="tray__adv-row">
            <button
              type="button"
              className="button button--adv"
              disabled={animating}
              onClick={onRollDisadvantage}
            >
              Roll At Disadvantage
            </button>
            <button
              type="button"
              className="button button--adv"
              disabled={animating}
              onClick={onRollAdvantage}
            >
              Roll At Advantage
            </button>
          </div>
        ) : null}
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
                advantageOutcome={die.advantageOutcome}
                advantageRoll={roll.advantage}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}