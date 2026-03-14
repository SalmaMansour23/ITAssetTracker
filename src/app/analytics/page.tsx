"use client";

/**
 * @fileoverview Analytics / Performance Metrics page ("/analytics" route).
 *
 * Provides IT administrators with a data-driven overview of asset request
 * patterns across the organisation.  All data is fetched directly from the
 * Supabase `asset_requests` table on mount and transformed into two
 * independent visualisation datasets:
 *
 *  1. **Status Distribution Bar Chart** – Aggregated count of requests grouped
 *     by status (Pending / Approved / Rejected) rendered with Recharts.
 *  2. **Quick Insights Panel** – A sidebar card showing the most-requested
 *     asset category with its share percentage, plus a chronological feed of
 *     the five most recent activity events.
 *
 * Both panels use Framer Motion entrance animations with a staggered delay
 * so the layout feels progressive rather than loading all at once.
 *
 * Data flow:
 *   Supabase (asset_requests) → fetchData() → state → Recharts / JSX rendering
 *
 * @module app/analytics/page
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3, TrendingUp, Activity, Loader2 } from "lucide-react";
import { format } from "date-fns";

/**
 * Analytics / Performance Metrics page component.
 *
 * On mount, fetches all asset requests from Supabase, computes aggregated
 * metrics (status counts, most-requested asset), and slices the five most
 * recent entries for the activity feed.  Loading and loaded UI states are
 * differentiated via the `loading` flag to prevent layout shift.
 *
 * @returns The analytics dashboard with an animated bar chart and a
 *   quick-insights sidebar showing top-requested assets and recent activity.
 */
export default function AnalyticsPage() {
  /**
   * Chart dataset: array of `{ name: string, value: number }` objects where
   * each entry represents a distinct request status and its total count.
   */
  const [data, setData] = useState<any[]>([]);

  /**
   * The five most recent asset requests ordered by `request_date` descending,
   * used to populate the Recent Activity feed in the Quick Insights panel.
   */
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  /**
   * Derived insight values computed from the full requests dataset:
   *  - `mostRequested`: The asset category with the highest submission count.
   *  - `percentage`: That category's share of total requests as a formatted string.
   */
  const [insights, setInsights] = useState({ mostRequested: "None", percentage: "0%" });

  /** True while the initial Supabase fetch is in-flight; drives skeleton/spinner states. */
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Fetches all asset requests from Supabase and derives three datasets:
     *  1. Status-grouped counts for the bar chart.
     *  2. Sliced recent activity for the activity feed (latest 5 records).
     *  3. Most-requested asset category with its percentage share.
     *
     * No real-time subscription is established here; the page is intended as
     * a periodic snapshot view rather than a live feed.
     */
    const fetchData = async () => {
      const { data: requests } = await supabase
        .from('asset_requests')
        .select('*')
        .order('request_date', { ascending: false });

      if (requests) {
        // ── 1. Build status-count dataset for the bar chart ────────────────
        // `reduce` accumulates a { [status]: count } map, then `Object.entries`
        // converts it to the `[{ name, value }]` shape expected by Recharts.
        const statusCounts = requests.reduce((acc: any, curr: any) => {
          acc[curr.status] = (acc[curr.status] || 0) + 1;
          return acc;
        }, {});
        setData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));

        // ── 2. Slice the five most recent requests for the activity feed ────
        setRecentActivity(requests.slice(0, 5));

        // ── 3. Derive the most-requested asset category ─────────────────────
        // Build a frequency map keyed by `item_needed`, sort descending by
        // count, then compute the top category's share of total submissions.
        const counts = requests.reduce((acc: any, curr: any) => {
          const item = curr.item_needed || "Other";
          acc[item] = (acc[item] || 0) + 1;
          return acc;
        }, {});
        
        const sorted = Object.entries(counts).sort((a: any, b: any) => (b[1] as number) - (a[1] as number));
        if (sorted[0]) {
          const mostRequested = sorted[0][0];
          const count = sorted[0][1] as number;
          const percentage = Math.round((count / requests.length) * 100);
          setInsights({ mostRequested, percentage: `${percentage}%` });
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  /**
   * Ordered colour palette applied cyclically to bar chart cells.
   * Index assignment is deterministic based on the sorted status entries so
   * the same status will always receive the same colour across renders.
   */
  const COLORS = ['#2563eb', '#10b981', '#ef4444', '#f59e0b'];

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
          <TrendingUp className="w-4 h-4" />
          Insight Hub
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Performance Metrics</h1>
        <p className="text-slate-500 text-lg">Visualizing asset allocation trends across the organization.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
          <Card className="border-slate-200 shadow-sm h-[500px]">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
                Request Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] pt-6">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-slate-200 shadow-sm h-[500px] overflow-hidden">
            <CardHeader className="bg-slate-50/50 pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Quick Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Most Requested</p>
                    <p className="text-lg font-bold text-blue-900 mt-1">{insights.mostRequested} ({insights.percentage})</p>
                    <p className="text-xs text-blue-700/70 mt-1 font-medium">Based on system volume.</p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Activity</h4>
                    <div className="space-y-4">
                      {recentActivity.length > 0 ? recentActivity.map((activity) => (
                        <div key={activity.id} className="flex gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
                          <div>
                            <p className="font-semibold text-slate-800 leading-tight">
                              {activity.item_needed} for {activity.employee_name.split(' ')[0]}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold tracking-tight">
                              {activity.status} • {format(new Date(activity.request_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      )) : (
                        <p className="text-xs text-slate-400 italic">No activity recorded yet.</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
