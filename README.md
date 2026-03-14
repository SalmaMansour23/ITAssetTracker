# GlowIT Assets — IT Asset Tracker

A modern, full-stack IT asset request management system built for enterprise IT teams. Employees submit hardware and software requests through a polished portal; IT administrators review, approve, or reject them from a live-updating control centre — all backed by Supabase Realtime so every change is reflected instantly across all connected clients.

---

## Features

| Feature | Description |
|---|---|
| **Asset Request Portal** | Multi-field animated form for employees to submit IT asset requests with client-side validation and instant feedback |
| **Admin Control Centre** | Full-lifecycle request management with inline Approve / Reject / Reset actions |
| **System Dashboard** | KPI stats grid showing total, approved, pending, and rejected request counts |
| **Analytics Page** | Bar chart breakdowns and a quick-insights panel (top asset category, recent activity feed) |
| **Realtime Sync** | Supabase Postgres CDC keeps every connected client in sync without manual refresh |
| **Dark-mode UI** | Glassmorphism cards, neon glow accents, and Framer Motion stagger animations throughout |

---

## Tech Stack

- **Framework** — [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
- **Language** — TypeScript 5
- **Database / Realtime** — [Supabase](https://supabase.com/) (`@supabase/supabase-js`)
- **UI Components** — [shadcn/ui](https://ui.shadcn.com/) on top of Radix UI primitives
- **Styling** — Tailwind CSS 3
- **Animations** — [Framer Motion](https://www.framer.com/motion/)
- **Charts** — [Recharts](https://recharts.org/)
- **Icons** — [Lucide React](https://lucide.dev/)
- **Forms** — React Hook Form + Zod

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # System Dashboard (root route "/")
│   ├── admin/page.tsx        # IT Administration / Control Centre ("/admin")
│   ├── analytics/page.tsx    # Performance Metrics & Charts ("/analytics")
│   ├── request/page.tsx      # Employee Asset Request Portal ("/request")
│   ├── layout.tsx            # Root layout with sidebar navigation
│   └── globals.css           # Global styles and CSS custom properties
├── components/
│   ├── dashboard/
│   │   └── stats-grid.tsx    # KPI cards (total / approved / pending / rejected)
│   ├── layout/
│   │   └── sidebar.tsx       # Collapsible sidebar with route links
│   ├── requests/
│   │   ├── admin-table.tsx   # Live request registry with status actions
│   │   └── request-form.tsx  # Employee submission form
│   └── ui/                   # shadcn/ui component library
├── hooks/
│   ├── use-toast.ts          # Toast notification hook
│   └── use-mobile.tsx        # Responsive breakpoint detection
└── lib/
		├── supabase.ts            # Supabase client singleton
		└── utils.ts               # Tailwind class merging utility
```

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- A [Supabase](https://supabase.com/) project with an `asset_requests` table (see [Database Setup](#database-setup))

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd ITAssetTracker

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Fill in your Supabase credentials (see Environment Variables below)

# 4. Start the development server
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser.

---

## Environment Variables

Create a `.env.local` file at the project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
```

Both values are available in your Supabase project under **Settings → API**.  
The anon key is safe to expose in the browser because Row Level Security (RLS) on Supabase enforces all actual access control.

---

## Database Setup

Run the following SQL in your Supabase SQL Editor to create the required table:

```sql
create table asset_requests (
	id            uuid primary key default gen_random_uuid(),
	full_name     text not null,
	department    text not null,
	item_needed   text not null,
	priority      text not null default 'Medium',
	required_from date,
	required_to   date,
	reason        text,
	status        text not null default 'Pending',
	request_date  timestamptz not null default now()
);

-- Enable Row Level Security
alter table asset_requests enable row level security;

-- Allow public reads and inserts (adjust to your auth requirements)
create policy "Public read" on asset_requests for select using (true);
create policy "Public insert" on asset_requests for insert with check (true);
create policy "Public update" on asset_requests for update using (true);
```

Enable the **Realtime** feature for the `asset_requests` table in **Database → Replication** to activate live sync.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server on port 9002 with Turbopack |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking without emitting files |

---

## Application Routes

| Route | Page | Access |
|---|---|---|
| `/` | System Dashboard | IT Administrators |
| `/admin` | IT Control Centre | IT Administrators |
| `/analytics` | Performance Metrics | IT Administrators |
| `/request` | Asset Request Portal | All Employees |
