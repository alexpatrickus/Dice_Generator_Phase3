import { useId, useState } from 'react'

export function CollapsiblePanel({ title, headingId, actions, defaultOpen = true, className = '', children }) {
  const [open, setOpen] = useState(defaultOpen)
  const bodyId = useId()
  const resolvedHeadingId = headingId ?? `${bodyId}-heading`

  return (
    <section className={`panel collapsible-panel${className ? ` ${className}` : ''}`} aria-labelledby={resolvedHeadingId}>
      <div className="panel__head collapsible-panel__head">
        <button
          type="button"
          className="collapsible-panel__trigger"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="collapsible-panel__chevron" aria-hidden="true" />
          <h2 id={resolvedHeadingId} className="collapsible-panel__title">
            {title}
          </h2>
        </button>
        {open ? actions : null}
      </div>
      <div id={bodyId} className="collapsible-panel__body" hidden={!open}>
        {children}
      </div>
    </section>
  )
}