# SecureVote — E-Voting Client

SecureVote is a **Next.js (App Router)** web client for a course-style **electronic voting** system. It combines **MongoDB** for persistence, **NextAuth.js v5** (credentials) for sessions, and **RSA-OAEP (SHA-256)** so ballot payloads stored in the database are not plain candidate IDs.

This repository is the **frontend + API routes** in a single Next.js app (no separate BFF repo).

---

## Table of contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Environment variables](#environment-variables)
5. [RSA key pair (ballots)](#rsa-key-pair-ballots)
6. [Install & run](#install--run)
7. [First-time setup (bootstrap admin)](#first-time-setup-bootstrap-admin)
8. [Routes & roles](#routes--roles)
9. [HTTP API (summary)](#http-api-summary)
10. [Security & privacy model](#security--privacy-model)
11. [Project structure](#project-structure)
12. [Scripts](#scripts)
13. [UI & theming](#ui--theming)
14. [Troubleshooting](#troubleshooting)

---

## Features

| Area | Description |
|------|-------------|
| **Landing** | Public `/` marketing page (SoftAurora background). Session-aware CTAs (Sign in vs Dashboard / Admin hub). |
| **Auth** | Username + password via NextAuth credentials; JWT session includes `id`, `role`, optional profile `image`. |
| **Roles** | **Admin** and **Voter**. Admins use `/admin/*`; voters use `/dashboard` and `/vote`. |
| **Registration** | First user in an empty database becomes **admin** (bootstrap). After that, only **admins** can create **voter** accounts via `/admin/register`. |
| **Voting** | One vote per voter (`hasVoted` + atomic update). Ballot stored as **RSA-encrypted** string; **no `userId` on vote documents**. |
| **Candidates** | Admins manage candidates (name, party, description, optional **portrait** and **poster** image URLs). Seeded defaults if collection is empty. |
| **Results** | Admins only: server decrypts ballots and aggregates counts (`/admin/results`, `GET /api/results`). |
| **Profile** | Signed-in users: view account info, optional **profile image URL**, change password. |
| **Media** | User and candidate images are **URL-only** (no uploads). `next.config.ts` uses `images.unoptimized: true` so `next/image` can load arbitrary `https` hosts. |
| **Sign out** | Redirects to **`/`** (landing). |

---

## Tech stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Language:** TypeScript
- **Database:** [MongoDB](https://www.mongodb.com/) via [Mongoose 8](https://mongoosejs.com/)
- **Auth:** [NextAuth.js v5](https://authjs.dev/) (`next-auth@beta`) — Credentials provider
- **Validation:** [Zod](https://zod.dev/)
- **Crypto (server):** Node.js `crypto` — RSA-OAEP / SHA-256 (`src/lib/ballotCrypto.ts`)
- **UI:** Tailwind CSS v4, [shadcn-style](https://ui.shadcn.com/) primitives (Radix Slot, CVA), `next-themes`, Lucide icons
- **Backgrounds:** `DotField` (interactive dot canvas) on app shell except landing; landing uses `SoftAurora`

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** (or pnpm/yarn)
- A running **MongoDB** instance (local or Atlas)
- OpenSSL or similar if you need to **generate RSA keys** (see below)

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in values:

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGODB_URI` | **Yes** | Mongo connection string (e.g. `mongodb://127.0.0.1:27017/secure-voting`) |
| `AUTH_SECRET` | **Yes** | Long random secret for NextAuth (signing/encryption of session tokens) |
| `VOTE_RSA_PUBLIC_KEY` | **Yes** for voting | PEM public key used to **encrypt** ballots before `Vote` documents are written |
| `VOTE_RSA_PRIVATE_KEY` | **Yes** for tally | PEM private key used to **decrypt** ballots when computing results (keep server-only; never expose to client) |

> **Note:** `mongodb.ts` throws at import time if `MONGODB_URI` is missing, so the app will not start without it.

---

## RSA key pair (ballots)

Keys must be **PEM** format. In `.env.local`, newlines inside the PEM are often stored as **literal `\n`** (backslash + n) on one line; the app normalizes them in `ballotCrypto.ts`.

**Generate a 2048-bit key pair (example):**

```bash
openssl genrsa -out vote-private.pem 2048
openssl rsa -in vote-private.pem -pubout -out vote-public.pem
```

Then paste the **full PEM** into `VOTE_RSA_PRIVATE_KEY` and `VOTE_RSA_PUBLIC_KEY`, escaping line breaks as `\n` if you keep each key on a single line in the env file.

**Constraints:**

- Ballot plaintext is the **MongoDB ObjectId string** of the candidate. RSA-OAEP payload size is small; keep keys **2048-bit** and candidate IDs as standard ObjectIds.
- If keys are missing or invalid, vote encryption or tally decryption will fail at runtime.

---

## Install & run

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Production build:**

```bash
npm run build
npm start
```

---

## First-time setup (bootstrap admin)

1. Ensure MongoDB is running and `MONGODB_URI` points to your database.
2. Visit **`/admin/register`** with an **empty** `User` collection.
3. The UI runs in **bootstrap** mode: create the **first** account — it becomes **`role: admin`**.
4. After that, `/admin/register` is only usable by signed-in **admins** to create **voters**.

Legacy **`/register`** redirects to **`/admin/register`**.

---

## Routes & roles

Route protection lives in **`src/proxy.ts`**. In **Next.js 16**, the older `middleware.ts` convention was renamed to **`proxy.ts`** (same idea: run before routes complete). This file wraps `auth()` and performs redirects for public paths, role checks, and login gating.

Public vs protected behavior is summarized below.

| Path | Who | Notes |
|------|-----|--------|
| `/` | Everyone | Landing; no forced redirect to dashboard when logged in |
| `/login` | Public | Logged-in users are redirected to hub (`/admin` or `/dashboard`) |
| `/admin/register` | Public **only** if DB has zero users; else **admin** | Voters hitting this while logged in are redirected away |
| `/dashboard`, `/vote`, `/profile`, … | **Signed in** | Voters; **admins** hitting `/dashboard` are sent to `/admin` |
| `/admin`, `/admin/candidates`, `/admin/users`, `/admin/results` | **Admin** | Non-admins redirected to `/dashboard` |
| `/api/*` | Mixed | Most APIs require session; candidate mutations and results require **admin** where applicable |

Unauthenticated users hitting protected pages are redirected to **`/login`**.

---

## HTTP API (summary)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/register` | Public if no users; else **admin** | Create user (bootstrap admin or voter) |
| `POST` | `/api/auth/*` | — | NextAuth handlers |
| `GET` | `/api/candidates` | Signed in | List candidates (seeds if empty) |
| `POST` | `/api/candidates` | **Admin** | Create candidate |
| `PATCH` / `DELETE` | `/api/candidates/[id]` | **Admin** | Update / delete candidate |
| `POST` | `/api/vote` | Voter (not voted) | Atomic `hasVoted` + encrypted `Vote` |
| `GET` | `/api/results` | **Admin** | Decrypted tally |
| `PATCH` | `/api/profile` | Signed in | Update `imageUrl` |
| `POST` | `/api/profile/password` | Signed in | Change password |

Request bodies are validated with **Zod** schemas in `src/lib/schemas.ts`.

---

## Security & privacy model

1. **Double voting:** `User.findOneAndUpdate({ _id, hasVoted: false }, { hasVoted: true })` — only one transition wins; if vote persistence fails, `hasVoted` is rolled back.
2. **Anonymity of choice:** `Vote` documents store **`encryptedBallot` only** (no `userId`). The link between a person and a choice is intentionally **not** stored next to the ballot row.
3. **Secrecy of tally inputs:** Without the **private** RSA key, stored ciphertexts are not candidate names in the clear.
4. **Role separation:** Admin UI and results APIs are gated by **`role === 'admin'`** in middleware and route handlers.

This is appropriate for a **student / demo** deployment; production elections need audits, key management (HSM), legal process, and threat modeling beyond this scope.

---

## Project structure

```
src/
├── app/                    # App Router pages & API routes
│   ├── page.tsx            # Landing (public)
│   ├── layout.tsx          # Fonts, ThemeProvider, AppDotFieldBackground
│   ├── login/              # Credentials sign-in
│   ├── dashboard/          # Voter hub
│   ├── vote/               # Ballot UI
│   ├── profile/            # Profile + password + image URL
│   ├── admin/              # Admin dashboard, candidates, users, results, register
│   ├── api/                # Route handlers (register, vote, candidates, profile, results, auth)
│   └── globals.css         # Design tokens, glass, gradient utilities
├── auth.ts                 # NextAuth configuration
├── proxy.ts                # Auth middleware (route gating)
├── components/             # UI (landing, vote client, forms, shadcn-style ui)
├── lib/                    # mongodb, schemas, ballotCrypto, electionTally, candidatesList, utils
├── models/                 # Mongoose: User, Candidate, Vote
└── types/next-auth.d.ts    # Session / JWT typings
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start production server (after `build`) |
| `npm run lint` | ESLint |

---

## UI & theming

- **Theme:** `next-themes` — system / light / dark; toggle appears on major layouts and landing.
- **App background:** `AppDotFieldBackground` wraps the app in `layout.tsx`. It skips the animated dot layer on **`/`** so the landing keeps its own background; all other routes get the **DotField** canvas plus a light readability scrim. Page shells use **`bg-transparent`** so the pattern shows through; cards and nav still use **glass / card** backgrounds.
- **Landing:** `LandingPage` uses **`useSession()`** — signed-in users see **Dashboard** / **Admin hub** instead of Sign in.

---

## Troubleshooting

| Symptom | Things to check |
|---------|------------------|
| `Please define the MONGODB_URI` | `.env.local` present next to `package.json`, variable set, dev server restarted |
| Vote or tally errors about RSA | `VOTE_RSA_*` set, PEM valid, `\n` escaping correct, pair matches |
| Always redirected to `/login` | Session cookie; `AUTH_SECRET` stable across restarts in dev |
| `403` on admin APIs | Logged in as **voter**; use an admin account |
| Images from URL not showing | URL must be valid `https` (or `http` in dev); invalid URLs fall back to initials / hidden poster |
| Redirects / auth gating wrong | On Next.js **15 and earlier**, the file was `middleware.ts`; this project targets **Next.js 16** with `src/proxy.ts`. See [Middleware → Proxy](https://nextjs.org/docs/messages/middleware-to-proxy) |

---

## License / course context

Built as part of a **DPDS** (distributed / project) course deliverable. Treat as **educational software**, not certified election infrastructure.

If you extend the repo, keep **secrets** (`.env.local`, private keys) out of version control and document any new env vars in **`.env.example`**.
