# Components Structure

This folder contains reusable building blocks used across the app.

## Sections

- `layout`: larger structural wrappers such as dashboard-level layouts
- `shared`: reusable feature sections shared across screens
- `ui`: low-level UI primitives and controls
- `figma`: reserved/generated component space, currently empty

## Guidance

- Add layout-level wrappers to `layout`
- Add feature-specific reusable sections to `shared`
- Add primitive controls and presentational building blocks to `ui`

Use `index.ts` files in these folders for cleaner imports when possible.
