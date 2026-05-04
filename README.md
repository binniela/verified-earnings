# Verified Earnings

Broad verified-earnings MVP built with Next.js 14, Tailwind, Supabase-shaped schema, and Stripe Connect-ready route handlers.

## What Is Implemented

- Public pages: `/`, `/map`, `/feed`, `/profile/[id]`, `/share/claim/[slug]`
- App pages: `/claim/new`, `/verify`, `/dashboard`, `/mentors`, `/admin`
- Core model: `earning_claims` with strict claim types and amount bases
- Verification logic: 10% amount matching, outlier flagging, manual-review routing, and auto-approval only for low-risk career docs
- Social map: city/category clusters, follows/saves API contracts, sample-size-aware rankings
- Mentorship: active offers tied to approved claims, Stripe Connect demo/production paths, 15% platform fee
- Supabase SQL: schema and RLS policy files in `supabase/`
- Tests: claim rules, analytics/ranking, verification parser logic

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The app runs in demo mode without credentials. Add values from `.env.example` to enable Supabase and Stripe-backed flows.

## Verification Philosophy

The badge verifies a specific claim, not a person’s whole credibility. Salary, business net profit, owner income, freelance net income, and realized trading P&L are separated throughout the data model, map, badges, feed, and mentor marketplace.

Business, freelance, and trading claims require manual review in the MVP. Screenshots, revenue-only business claims, leaderboard images, Discord claims, unrealized gains, and guaranteed-return trading offers are intentionally excluded.

## Design Inspiration

The `/map` command-center surface is adapted from the public MIT-licensed [`andrewjiang/palantir-for-family-trips`](https://github.com/andrewjiang/palantir-for-family-trips) visual direction: dense dark dashboard, operational panels, layer controls, and selected-entity briefings. The implementation here is original to Verified Earnings and uses the earnings claim model rather than trip-planning logic.

## Intelligence-Terminal Design System

The app uses a dark command-interface system rather than a friendly SaaS theme. Core tokens live in `src/app/globals.css` and Tailwind aliases live in `tailwind.config.ts`.

- Base: `ops-bg #0A0C10`, `ops-panel #0D1117`, `ops-surface #161B22`, `ops-border #30363D`
- Text: `ops-text #F0F6FC`, `ops-muted #8B949E`
- Status: blue intelligence, green verified, amber caution, red risk, purple trading
- Layout: command pages use `CommandShell`, `CommandHeader`, `CommandGrid`, `CommandPanel`, `MetricTile`, `StatusPill`, and `ActionChip`
- Copy: prefer `Verified claims`, `Manual review required`, `More data needed`, `Rank cards online`, `Mentor signal`, `Proof dossier`, `Watch market`
- Prohibited MVP patterns: pastel cards, large rounded SaaS panels, decorative blobs, vague growth copy, likes/comments language, and badges that hide what was actually verified
