# Source Structure

The `src` folder is split into a small number of top-level areas:

- `main.tsx`: starts the application
- `styles`: global styling entry and theme files
- `app`: the application structure itself

## App Area

Inside `app`, the code is grouped by responsibility:

- `components`: reusable UI and layout building blocks
- `data`: local static data
- `pages`: screen-level components grouped by role
- `route-config`: grouped route definitions
- `storage`: local persistence helpers
- `routes.ts`: final router assembly
- `App.tsx`: app shell using the router
