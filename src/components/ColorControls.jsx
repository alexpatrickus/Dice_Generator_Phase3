export function ColorControls({ faceColor, markColor, onFaceColor, onMarkColor }) {
  return (
    <section className="panel color-panel" aria-labelledby="colors-heading">
      <div className="panel__head">
        <h2 id="colors-heading">Dice colors</h2>
      </div>
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
    </section>
  )
}