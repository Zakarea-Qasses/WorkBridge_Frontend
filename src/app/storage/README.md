# Storage Structure

This folder contains the app-side storage helpers used by the frontend.

These files mainly wrap `localStorage` and keep feature state grouped by domain.

## Files

- `walletStorage.ts`: wallet balances, transactions, escrow-like flows, and related helpers
- `servicesStorage.ts`: service records and service lifecycle updates
- `supportStorage.ts`: support tickets, complaints, and support workflows
- `reviewsStorage.ts`: post-completion review storage and review-related helpers
- `jobApplicationStorage.ts`: job application state for user job submissions
- `index.ts`: grouped exports for easier imports

## Purpose

The project currently uses these helpers instead of a real backend, so this folder acts as the app's local state persistence layer.
