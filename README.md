# Dice Generator — Phase 3

Extension of [Dice_Generator](https://github.com/alexpatrickus/Dice_Generator) with:

- **Roll animation** — ~600ms tumble on result faces; roll actions disabled until it finishes. Respects `prefers-reduced-motion`.
- **Custom colors** — face and marking colors via pickers; persisted in `localStorage`.
- **Roll history** — last 20 rolls (notation, total, expandable breakdown); persisted in `localStorage`.

## Scripts

```bash
npm install
npm run dev
npm test
```

## Storage

Data is stored under the key `dice-generator-phase3` so it does not collide with the original app.