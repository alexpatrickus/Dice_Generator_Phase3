import { CollapsiblePanel } from './CollapsiblePanel.jsx'

export function ColorControls({ faceColor, markColor, onFaceColor, onMarkColor }) {
  return (
    <CollapsiblePanel title="Dice colors" headingId="colors-heading" className="color-panel">
      <div className="color-panel__fields">
        <label className="color-field">
          <span>Face</span>
          <input
            type="color"
            value={faceColor}
            onChange={(event) => onFaceColor(event.target.value)}
          />
        </label>
        <label className="color-field">
          <span>Markings</span>
          <input
            type="color"
            value={markColor}
            onChange={(event) => onMarkColor(event.target.value)}
          />
        </label>
      </div>
    </CollapsiblePanel>
  )
}