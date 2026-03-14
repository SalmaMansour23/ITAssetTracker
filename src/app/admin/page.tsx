"use client";

/**
 * @fileoverview IT Administration / Control Center page ("/admin" route).
 *
 * Provides IT administrators with full lifecycle management over all submitted
 * asset requests.  Unlike the read-only dashboard view, this page exposes
 * action controls (Approve / Reject / Reset) on every request row, enabling
 * real-time status updates that propagate instantly via Supabase Realtime
 * subscriptions.
 *
 * Key features:
 *  - Live-filtered request registry powered by Supabase Postgres CDC.
 *  - Search bar for filtering by employee name, department, or asset type.
 *  - Inline status management via the {@link AdminTrackingTable} component.
 *
 * @module app/admin/page
 */

import { useState } from "react";
import { AdminTrackingTable } from "@/components/requests/admin-table";
import { ShieldCheck, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * IT Administration page component.
 *
 * Renders the Control Center header, a search/filter toolbar, and the full
 * interactive request registry.  Search state is managed locally and passed
 * to {@link AdminTrackingTable} for synchronised client-side filtering.
 *
 * @returns The administration page layout with a searchable, actionable
 *   request management table.
 */
export default function AdminPage() {
  /** Controlled search value used to filter the request registry in real-time. */
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------------ */}
      {/* Page Header                                                          */}
      {/* ------------------------------------------------------------------ */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          {/* Section badge – provides visual context for the control-center scope */}
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            Control Center
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">IT Management</h1>
          <p className="text-slate-500">Review, process, and track enterprise asset acquisitions.</p>
        </div>
        
        {/* Search and filter toolbar */}
        <div className="flex items-center gap-3">
          {/*
           * Search input with an absolutely-positioned icon overlay.
           * The `group` utility enables the sibling icon to react to
           * focus-within state, improving keyboard accessibility feedback.
           */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search registry..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-white border-slate-200 focus:ring-primary/20"
            />
          </div>
          {/* Placeholder filter button – reserved for future advanced filter panel */}
          <Button variant="outline" className="border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Request Management Table                                            */}
      {/* ------------------------------------------------------------------ */}
      <section>
        {/*
         * Full-featured table with Approve / Reject / Reset action controls.
         * `showActions={true}` enables the action column; status changes are
         * persisted directly to Supabase and broadcast via Realtime.
         */}
        <AdminTrackingTable showActions={true} searchQuery={searchQuery} />
      </section>
    </div>
  );
}
