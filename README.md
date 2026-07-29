# LingoTrace

LingoTrace is a mobile-first English learning tracker for importing structured ChatGPT speaking reports, reviewing vocabulary and sentence patterns, tracking corrections, and generating targeted grammar practice.

## Features

- Google sign-in through Supabase Auth
- Import and merge `LINGOTRACE_REPORT_V1` JSON reports
- Vocabulary, sentence-pattern, and correction libraries
- Spaced-review state and lightweight practice tracking
- Gemini-generated grammar practice with a deterministic local fallback
- Installable PWA interface

## Tech stack

- React, TypeScript, Vite and Tailwind CSS
- Supabase Auth, Postgres, Row Level Security and Edge Functions
- Gemini API, called only from a Supabase Edge Function

## Local setup

Requirements: Node.js and pnpm.

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy `.env.example` to `.env.local` and provide your own Supabase project values:

   ```env
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_your_key"
   ```

3. Apply the SQL files in `supabase/migrations/` to your Supabase project in filename order.

4. Add `GEMINI_API_KEY` to Supabase Edge Function Secrets. Never place this key in a `VITE_` variable or commit it to Git.

5. Deploy the Edge Function:

   ```bash
   supabase functions deploy generate-grammar-practice
   ```

6. Start the app:

   ```bash
   pnpm dev
   ```

## Security notes

- `.env.local` and other `.env*` files are ignored by Git; only `.env.example` is tracked.
- The Supabase publishable key is intended for browser use. Database access is protected by the included owner-only Row Level Security policies.
- Never commit a Supabase service-role key, Gemini API key, access token, user export, or real conversation JSON.
- Use your own Supabase and Gemini projects when deploying a fork.

## Data format

The importer accepts a complete `LINGOTRACE_REPORT_V1` JSON object. Required time fields must be numbers, scores use a 0–10 scale, and sentence categories and correction categories must match the allowed values enforced in `src/services/reportImport.ts`.

## Deployment

The frontend can be deployed to Vercel or another Vite-compatible static host. Configure the two public Supabase environment variables in the hosting dashboard. Supabase database migrations, secrets, and Edge Functions are deployed separately.

## Privacy

This repository contains demonstration data only. Do not commit real learning reports, account exports, chat histories, or local environment files.
