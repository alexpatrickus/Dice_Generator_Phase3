import { useState } from 'react'
import { formatDieBreakdown } from '../lib/dice.js'
import { CollapsiblePanel } from './CollapsiblePanel.jsx'

function formatTime(timestamp) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(timestamp))
  } catch {
    return '—'
  }
}

export function History({ history, onClear }) {
  const [openId, setOpenId] = useState(null)

  return (
    <CollapsiblePanel
      title="Roll history"
      headingId="history-heading"
      className="history-panel"
      actions={
        <button
          type="button"
          className="button button--ghost"
          disabled={history.length === 0}
          onClick={onClear}
        >
          Clear
        </button>
      }
    >
      {history.length === 0 ? (
        <p className="muted history-panel__empty">No rolls yet.</p>
      ) : (
        <ul className="history-list">
          {history.map((entry) => {
            const expanded = openId === entry.id
            return (
              <li key={entry.id} className="history-list__item">
                <button
                  type="button"
                  className="history-list__summary"
                  aria-expanded={expanded}
                  onClick={() => setOpenId(expanded ? null : entry.id)}
                >
                  <span className="history-list__time">{formatTime(entry.timestamp)}</span>
                  <span className="history-list__notation">{entry.notation}</span>
                  <strong className="history-list__total">{entry.total}</strong>
                </button>
                {expanded ? (
                  <ul className="history-list__dice" aria-label="Individual dice in this roll">
                    {entry.dice.map((die) => (
                      <li key={die.id}>
                        D{die.sides}: {formatDieBreakdown(die)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </CollapsiblePanel>
  )
}