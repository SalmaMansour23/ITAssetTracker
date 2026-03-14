"use client";

/**
 * @fileoverview Main System Dashboard page (root route "/").
 *
 * Serves as the primary landing page for IT administrators after login.
 * The page presents a high-level overview of the organisation's IT asset
 * estate through two key sections:
 *
 *  1. **Stats Grid** – Real-time KPI cards summarising total, approved,
 *     pending, and rejected requests fetched live from Supabase.
 *  2. **Request Registry** – A read-only, searchable snapshot of all asset
 *     requests rendered via {@link AdminTrackingTable} (action buttons hidden).
 *
 * Global search state is managed locally so the header search input and the
 * table component remain decoupled and independently testable.
 *
 * @module app/page
 */

import { useState } from "react";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { AdminTrackingTable } from "@/components/requests/admin-table";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

/**
 * System Dashboard page component.
 *
 * Renders the top-level analytics overview and asset request registry for
 * authenticated IT administrators.  Search state is lifted to this level so
 * the controlled input in the header can filter the request table below.
 *
 * @returns The full dashboard layout including the page header, KPI stats,
 *   and the searchable request registry table.
 */
export default function Home() {
  /** Controlled value for the global request registry search field. */
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-10">
      {/* ------------------------------------------------------------------ */}
      {/* Page Header                                                          */}
      {/* ------------------------------------------------------------------ */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Dashboard</h1>
          <p className="text-slate-500 text-sm">Real-time status of company IT assets and requests.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/*
           * Inline search box – drives `searchQuery` state which is passed
           * down to the AdminTrackingTable for client-side filtering.
           */}
          <div className="bg-white border border-slate-200 rounded-lg flex items-center gap-2 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search registry..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-48 text-slate-700 placeholder:text-slate-400"
            />
          </div>

          {/* Administrator avatar / profile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 h-9 w-9 rounded-full overflow-hidden border border-slate-300">
                <div className="h-full w-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold">
                  IT
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>IT Administrator</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Profile sub-items removed per request */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Dashboard Body                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-8">
        {/* Real-time KPI stat cards (Total / Approved / Pending / Rejected) */}
        <StatsGrid />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Request Registry</h2>
          </div>

          {/*
           * Read-only table view of all asset requests.
           * `showActions={false}` hides the Approve/Reject controls,
           * making this a monitoring-only view for the dashboard.
           */}
          <AdminTrackingTable showActions={false} searchQuery={searchQuery} />
        </div>
      </div>
    </div>
  );
}
