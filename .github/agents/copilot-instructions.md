# e-masjid.my Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-07-16

## Active Technologies
- TypeScript 5.2+, React 18+, Node.js >=18.0.0 + Material-UI v6, Next.js 15 app router, React Router v6 (existing apps), Zustand, Supabase JS clien (007-tv-landing-tiers)
- Supabase PostgreSQL + RLS + optional cache table for prayer-time metadata (007-tv-landing-tiers)
- TypeScript 5.2+, React 18+, Node.js >=18.0.0 + Material-UI v6, Next.js 15 (existing tv-display app host), React Router v6 (existing navigation dependency), Zustand, Supabase JS clien (007-tv-landing-tiers)
- Supabase PostgreSQL + RLS + realtime; prayer-time cache persisted through package-managed store (007-tv-landing-tiers)
- SQL (PostgreSQL/Supabase), TypeScript 5.2+, Node.js >=18.0.0 + Supabase PostgreSQL, `@masjid-suite/supabase-client`, `@masjid-suite/shared-types`, Vitest, Playwrigh (001-masjid-tv-display)
- Supabase PostgreSQL with RLS (001-masjid-tv-display)

- TypeScript 5.2+, React 18+, Node.js >=18.0.0 + Material-UI v6, React Router v6, Zustand, Vite (007-tv-landing-tiers)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.2+, React 18+, Node.js >=18.0.0: Follow standard conventions

## Recent Changes
- 001-masjid-tv-display: Added SQL (PostgreSQL/Supabase), TypeScript 5.2+, Node.js >=18.0.0 + Supabase PostgreSQL, `@masjid-suite/supabase-client`, `@masjid-suite/shared-types`, Vitest, Playwrigh
- 007-tv-landing-tiers: Added TypeScript 5.2+, React 18+, Node.js >=18.0.0 + Material-UI v6, Next.js 15 (existing tv-display app host), React Router v6 (existing navigation dependency), Zustand, Supabase JS clien
- 007-tv-landing-tiers: Added TypeScript 5.2+, React 18+, Node.js >=18.0.0 + Material-UI v6, Next.js 15 app router, React Router v6 (existing apps), Zustand, Supabase JS clien


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
