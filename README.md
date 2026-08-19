This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL` to the backend API URL before starting the app.

## Data and state architecture

React Query owns server state: API responses, loading and error status, caching, refetching, and invalidation. Query keys should come from `src/lib/queryKeys.ts` so cache updates remain consistent.

Zustand owns client UI state that must be shared between components, such as the authenticated session, selected wallet or campaign, panels, and filters. API response collections and other server-owned data should not be copied into Zustand; keeping them in both systems creates competing sources of truth and stale UI bugs.

## Authentication architecture

Wallet-based authentication follows a challenge → sign → verify flow managed by `walletStore`. Once verified the backend returns an access token and a refresh token. Both are persisted in `authStore` (via `localStorage`) so the session survives page reloads.

### Refresh-token rotation

On every successful `/auth/refresh` call the backend issues a **new** refresh token and invalidates the old one. The client tracks a sequence counter and a `previousToken` reference so that any reuse of an already-rotated token is immediately rejected and the user is forced to re-authenticate.

### Session safety guarantees

- **No partial auth** — if challenge, signature, or verification fails the wallet store rolls back to `idle` and clears the auth store so the user never lands in a half-logged-in state.
- **Deduplicated re-auth** — concurrent 401 responses are queued; only one re-auth modal is shown and only one refresh request is made.
- **Clean logout** — `clearAuth` marks the current refresh token as used (detecting reuse), removes persisted state, and clears the session cookie.
- **Cross-tab consistency** — on mount `providers.tsx` checks the session cookie; if it has been removed by another tab the Zustand state is reset.
- **User-friendly errors** — raw backend or wallet exceptions are mapped to short, actionable messages before being shown in the UI or toast notifications.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
