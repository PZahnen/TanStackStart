# TanStack Start Project Setup

## Getting Started

This project was started using:

1. [TanStack Start Framework](https://tanstack.com/start/latest/docs/framework/react/build-from-scratch)
2. [shadcn/ui Components](https://ui.shadcn.com/docs/installation/tanstack)

### Project Setup

- Ignored vite.config.ts and first command from 2. link
- Included Tailwind in package.json

### Manual Configuration Files

The following files were manually created before installing shadcn:

- `tailwind.config.ts`
- `postcss.config.tsx`
- `app/styles.css` (imported in `__root.tsx`)
- `app/lib/utils.ts` (required for shadcn/ui)

## Project Goal

This project aims to create a small trivia quiz app using the [Open Trivia Database](https://opentdb.com/) API. The main purpose is to gain hands-on experience with TanStack Start and its ecosystem.

## Current Status

- General Quiz is fully implemented.
- Music Quiz is fully implemented using TanStack Query. Seems to work better this way.

  When fetching data more often than every 3 seconds from API, it will cause an error.

## Development

To run the project locally:

```bash
npm run dev
```
