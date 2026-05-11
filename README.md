# GVU Votes

A modern voting platform for Godfrey V. University (GVU) elections. Contestants register for categories, and students cast votes for their favorite candidates. Built with TanStack Start, React, TypeScript, Supabase, and shadcn/ui.

## Features

- **Contestant Registration** — Students register with personal details, category selection, campaign bio, and profile image
- **Live Voting** — Cast votes for contestants across multiple categories (one vote per category per voter)
- **Leaderboard** — Real-time standings with podium top-three display
- **Category Filtering** — Browse contestants by category (Mr GVU, Miss GVU, Ebony of the Year, etc.)
- **Google OAuth** — Authentication via Supabase + Google
- **Dark Mode** — Built-in theme switching
- **Responsive Design** — Full mobile/desktop support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [TanStack Start](https://tanstack.com/start) (React) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Backend / Auth | Supabase |
| Payments | — |
| Forms | React Hook Form + Zod |
| Data Fetching | TanStack Query |
| Routing | TanStack Router |
| Build | Vite |

## Project Structure

```
src/
├── components/         # Shared UI components
│   ├── navbar.tsx
│   ├── signin-dialog.tsx
│   └── ui/            # shadcn/ui primitives
├── contexts/
│   ├── auth.tsx        # Auth context type definition
│   └── auth-provider.tsx  # Auth provider with Supabase
├── features/
│   ├── contestants/    # Contestant registration, listing, API, hooks
│   ├── leaderboard/    # Leaderboard display components
│   └── votin/          # (reserved for voting features)
├── hooks/
│   └── use-has-voting-ended.ts
├── lib/
│   ├── constants.ts    # Departments, categories, voting end time
│   ├── register-schema.ts
│   ├── supabase.ts     # Supabase client + auth helpers
│   └── utils.ts        # cn(), slugify(), isUuid()
├── routes/
│   ├── __root.tsx      # Root layout (QueryClient, AuthProvider)
│   ├── index.tsx       # Home page
│   ├── register.tsx    # Contestant registration page
│   ├── leaderboard.tsx # Leaderboard page
│   ├── maintenance.tsx # Maintenance page
│   ├── vote/$slug.tsx  # Individual contestant vote page
│   └── contestants/$id/edit.tsx
├── router.tsx
├── routeTree.gen.ts
└── styles.css
```

## Environment Variables

Create a `.env` file in the project root:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

All variables are prefixed with `VITE_` (required by Vite for client-side exposure).

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm (recommended) or npm
- A Supabase project

### Setup

```bash
# Clone the repo
git clone https://github.com/Smartlify07/Gvu-Votes.git
cd gvu-votes

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Supabase Setup

1. Create a Supabase project
2. Enable **Google Auth** in Authentication > Providers
3. Create the following database tables (or enable Row Level Security as needed):
   - `categories` — id, label, value, created_at
   - `contestants` — id, name, matriculationNumber, email, department, category_id, avatarUrl, bio, user_id
   - `votes` — id, voter_id, contestant_id, created_at (with unique constraint on voter_id + category through the contestant's category)
   - View `contestants_with_vote_counts` — for pre-joined vote counts
4. Set up a **storage bucket** named `contestants` for profile image uploads

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server on port 3000 |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run tests (Vitest) |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |
| `pnpm typecheck` | Type-check with `tsc --noEmit` |

## Deployment

The project includes a `vercel.json` and is ready for Vercel deployment:

```bash
pnpm build
pnpm preview
```

For Vercel, connect your repo and set the environment variables in the Vercel dashboard.

## Configuration

- **Voting end time** — Edit `VOTING_END_TIME` in `src/lib/constants.ts`
- **Departments** — Edit the `DEPARTMENTS` array in `src/lib/constants.ts`
- **Categories** — Managed in the Supabase `categories` table
- **File size limit** — Edit `MAX_FILE_SIZE` in `src/features/contestants/components/register-form.tsx`

## License

MIT
