# IT Asset Tracker

## What this app does

This app helps a company manage IT asset requests.

- Employees submit requests for laptops, software, and other tools.
- IT admins review all requests in one place.
- Admins can approve, reject, or reset request status.
- Dashboards and analytics show request trends and current status.
- Data updates in real time using Supabase.

## How to use it

1. Install dependencies:
   npm install
2. Add environment variables in .env.local:
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
3. Start the app:
   npm run dev
4. Open http://localhost:9002
5. Use the routes:
   /request for employee submissions
   /admin for admin review and status actions
   /analytics for metrics
