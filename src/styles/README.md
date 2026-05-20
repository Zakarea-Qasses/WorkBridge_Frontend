# Styles Structure

This folder holds the global styling layers for the app:

- `index.css`: the main style entry loaded by the application
- `fonts.css`: external font loading
- `tailwind.css`: Tailwind and animation imports
- `theme.css`: design tokens, colors, and shared theme variables

## Load Order

The app loads `index.css`, and that file imports the rest in this order:

1. `fonts.css`
2. `tailwind.css`
3. `theme.css`

This keeps typography, utility layers, and theme variables centralized.
