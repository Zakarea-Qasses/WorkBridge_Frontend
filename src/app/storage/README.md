# Storage Structure

This folder contains the app-side storage helpers used by the frontend.

These files mainly wrap `localStorage` and keep feature state grouped by domain.

## Files

- `walletStorage.ts`: wallet balances, transactions, escrow-like flows, and related helpers
- `messagesStorage.ts`: conversations, hidden chats, reports, and moderation-related chat state
- `servicesStorage.ts`: service records and service lifecycle updates
- `serviceRequestStorage.ts`: service request records and request state changes
- `supportStorage.ts`: support tickets, complaints, and support workflows
- `reviewsStorage.ts`: post-completion review storage and review-related helpers
- `jobApplicationStorage.ts`: job application state for user job submissions
- `companyApplicantsStorage.ts`: company-side applicant tracking helpers
- `index.ts`: grouped exports for easier imports

## Purpose

The project currently uses these helpers instead of a real backend, so this folder acts as the app's local state persistence layer.
