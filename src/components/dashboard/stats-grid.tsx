"use client";

/**
 * @fileoverview Dashboard statistics grid component.
 *
 * Renders a responsive four-column card grid displaying real-time KPI counts
 * for the IT asset request system.  Each card represents one request lifecycle
 * state: Total, Approved, Pending, and Rejected.
 *
 * Data strategy:
 *  - Initial fetch on mount retrieves all `status` values from the
 *    `asset_requests` Supabase table and derives counts client-side to avoid
 *    multiple round-trips.
 *  - A Supabase Realtime channel subscribes to Postgres CDC (Change Data
 *    Capture) events on the `asset_requests` table so stat cards update
 *    automatically whenever any request is created, updated, or deleted —
 *    without requiring a page refresh.
 *  - The channel is unsubscribed on component unmount to prevent memory leaks
 *    and unnecessary server-side connections.
 *
 * Animation strategy:
 *  - Container variant staggers card entrance animations with a 100 ms delay
 *    between each card for a progressive reveal effect.
 *  - Individual cards animate from `opacity: 0, y: 10` to their resting state.
 *
 * @module components/dashboard/stats-grid
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Cpu, CheckCircle2, Clock, Ban, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

/**
 * StatsGrid component.
 *
 * Queries Supabase for asset request status counts and renders them as
 * four animated KPI cards.  A Realtime subscription keeps the counts live
 * for the duration of the component's lifecycle.
 *
 * @returns A responsive 4-column grid of KPI stat cards, or a full-width
 *   loading indicator while data is being fetched.
 */
export function StatsGrid() {
  /**
   * Stat card configuration array.  Each element contains:
   *  - `label`  – Human-readable card title.
   *  - `value`  – Numeric count displayed as a string (updated after fetch).
   *  - `icon`   – Lucide icon component rendered inside the coloured badge.
   *  - `color`  – Tailwind text-colour class for the icon.
   *  - `bg`     – Tailwind background-colour class for the icon container.
   */
  const [stats, setStats] = useState([
    { label: "Total Requests", value: "0", icon: Cpu,          color: "text-blue-600",    bg: "bg-blue-50"    },
    { label: "Approved",       value: "0", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending",        value: "0", icon: Clock,        color: "text-amber-600",   bg: "bg-amber-50"   },
    { label: "Rejected",       value: "0", icon: Ban,          color: "text-red-600",     bg: "bg-red-50"     },
  ]);

  /** True while the initial Supabase query is in-flight; drives the loading skeleton. */
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Fetches the `status` column for all asset requests, derives per-status
     * counts, and updates the stats state.  Re-used as the Realtime callback
     * so both initial load and live updates share the same logic.
     */
    async function fetchStats() {
      try {
        const { data, error } = await supabase
          .from('asset_requests')
          .select('status');

        if (error) throw error;

        if (data) {
          // Derive per-status counts from the lightweight status-only payload.
          const total    = data.length;
          const approved = data.filter(r => r.status === 'Approved').length;
          const pending  = data.filter(r => r.status === 'Pending').length;
          const rejected = data.filter(r => r.status === 'Rejected').length;

          setStats([
            { label: "Total Requests", value: total.toString(),    icon: Cpu,          color: "text-blue-600",    bg: "bg-blue-50"    },
            { label: "Approved",       value: approved.toString(), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Pending",        value: pending.toString(),  icon: Clock,        color: "text-amber-600",   bg: "bg-amber-50"   },
            { label: "Rejected",       value: rejected.toString(), icon: Ban,          color: "text-red-600",     bg: "bg-red-50"     },
          ]);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();

    // ── Supabase Realtime subscription ─────────────────────────────────────
    // Subscribes to all INSERT / UPDATE / DELETE events on the asset_requests
    // table.  On any change, re-runs fetchStats() so the KPI cards stay current
    // without requiring a manual page refresh.
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'asset_requests' }, () => {
        fetchStats();
      })
      .subscribe();

    // Cleanup: unsubscribe the Realtime channel on component unmount to
    // prevent memory leaks and orphaned server-side subscriptions.
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Framer Motion variant definitions ────────────────────────────────────
  // `container` staggers child animations; `item` defines the per-card entrance.
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show:   { opacity: 1, y: 0  }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 h-32 items-center justify-center">
        <div className="col-span-full flex items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Calculating system metrics...</span>
        </div>
      </div>
    );
  }

  // ── Loaded state ──────────────────────────────────────────────────────────
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
    >
      {stats.map((stat, idx) => (
        <motion.div key={idx} variants={item}>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
