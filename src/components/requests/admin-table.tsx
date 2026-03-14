
"use client";

/**
 * @fileoverview Admin request tracking table component.
 *
 * Provides a full-featured data table for viewing and managing IT asset
 * requests stored in the Supabase `asset_requests` table.  The component is
 * used in two distinct contexts:
 *
 *  - **Dashboard (read-only)**: `showActions={false}` hides the action column
 *    so the table serves purely as a monitoring view.
 *  - **Administration page (full control)**: `showActions={true}` exposes
 *    Approve / Reject / Reset buttons per row, enabling real-time status
 *    lifecycle management.
 *
 * Data strategy:
 *  - Initial data fetch on mount retrieves all requests ordered by creation
 *    date descending.
 *  - A Supabase Realtime Postgres CDC subscription auto-refreshes the table
 *    on any INSERT, UPDATE, or DELETE event without a page reload.
 *  - Client-side filtering is applied to the fetched dataset based on the
 *    `searchQuery` prop, avoiding unnecessary network round-trips.
 *
 * @module components/requests/admin-table
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Check, X, Clock, Loader2, User, Cpu, AlertCircle, RotateCcw, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

/**
 * Props accepted by the {@link AdminTrackingTable} component.
 */
interface AdminTrackingTableProps {
  /**
   * When `true`, renders an "Actions" column with Approve / Reject / Reset
   * buttons for each request row.  Set to `false` for read-only dashboard views.
   *
   * @default true
   */
  showActions?: boolean;

  /**
   * A search string used to filter displayed rows by employee name, department,
   * or requested asset type.  Filtering is applied client-side on the cached
   * dataset to avoid unnecessary Supabase queries on every keystroke.
   *
   * @default ""
   */
  searchQuery?: string;
}

/**
 * AdminTrackingTable component.
 *
 * Renders an animated, paginated-ready data table of IT asset requests with
 * conditional action controls and live Supabase Realtime synchronisation.
 *
 * @param props - See {@link AdminTrackingTableProps}.
 * @returns A styled data table, a loading spinner, or an empty-state card
 *   depending on current fetch and filter state.
 */
export function AdminTrackingTable({ showActions = true, searchQuery = "" }: AdminTrackingTableProps) {
  /** Full dataset of asset requests fetched from Supabase, unsorted client-side. */
  const [requests, setRequests] = useState<any[]>([]);

  /** True while the initial Supabase query is in-flight. */
  const [loading, setLoading] = useState(true);

  /**
   * ID of the request currently being updated via the Approve / Reject / Reset
   * controls.  Used to disable action buttons on that row during the async
   * Supabase write to prevent duplicate submissions.
   */
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { toast } = useToast();

  /**
   * Fetches all rows from `asset_requests` ordered by `created_at` descending
   * and replaces the local `requests` state.  Re-used as the Realtime event
   * handler so both initial load and live change events share identical logic.
   */
  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('asset_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err: any) {
      console.error("Supabase error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    
    // ── Supabase Realtime subscription ─────────────────────────────────────
    // Listens for any change to the asset_requests table and re-fetches the
    // full dataset to keep the table in sync across browser tabs and admin
    // sessions without requiring a manual refresh.
    const channel = supabase
      .channel('public:asset_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'asset_requests' }, () => {
        fetchRequests();
      })
      .subscribe();

    // Unsubscribe the Realtime channel on unmount to release server resources.
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /**
   * Persists a status change for a single asset request to Supabase and
   * triggers a UI toast notification confirming the outcome.
   *
   * @param id        - The UUID of the request row to update.
   * @param newStatus - The target lifecycle status: `'Approved'`, `'Rejected'`,
   *                    or `'Pending'` (used for the Reset action).
   */
  const updateStatus = async (id: string, newStatus: string) => {
    // Lock the row's action buttons for the duration of the async write.
    setUpdatingId(id);
    const { error } = await supabase
      .from('asset_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message
      });
    } else {
      toast({
        title: "Status Updated",
        description: `Request has been marked as ${newStatus}.`
      });
      // Re-fetch immediately so the table reflects the new status without
      // waiting for the Realtime event (which may be slightly delayed).
      fetchRequests();
    }
    setUpdatingId(null);
  };

  /**
   * Client-side filtered view of `requests` based on the `searchQuery` prop.
   * Matches against employee name, department, and item_needed fields using
   * case-insensitive substring comparison.
   */
  const filteredRequests = requests.filter(req => {
    const query = searchQuery.toLowerCase();
    return (
      req.employee_name?.toLowerCase().includes(query) ||
      req.department?.toLowerCase().includes(query) ||
      req.item_needed?.toLowerCase().includes(query)
    );
  });

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-64 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-slate-500 font-medium">Loading registry...</p>
      </div>
    );
  }

  // ── Empty / no-results state ───────────────────────────────────────────────
  if (filteredRequests.length === 0) {
    return (
      <div className="h-64 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2">
        <AlertCircle className="w-8 h-8 text-slate-300" />
        <p className="text-slate-500 font-medium">No records found.</p>
        <p className="text-slate-400 text-sm">
          {searchQuery ? "Try adjusting your search query." : "Once users submit requests, they will appear here."}
        </p>
      </div>
    );
  }

  // ── Populated table ──────────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="text-slate-600 font-bold py-4 pl-6">Employee</TableHead>
            <TableHead className="text-slate-600 font-bold py-4">Item Needed</TableHead>
            <TableHead className="text-slate-600 font-bold py-4">Requested Period</TableHead>
            <TableHead className="text-slate-600 font-bold py-4">Priority</TableHead>
            <TableHead className="text-slate-600 font-bold py-4">Status</TableHead>
            {showActions && <TableHead className="text-slate-600 font-bold py-4 text-right pr-6">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/*
           * AnimatePresence with mode="popLayout" enables outgoing rows to
           * animate out before the layout reflows, preventing jarring jumps
           * when rows are removed after a status-driven filter change.
           */}
          <AnimatePresence mode="popLayout">
            {filteredRequests.map((req, i) => (
              <motion.tr
                key={req.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.02 }}  /* Stagger entrance by 20 ms per row */
                className="hover:bg-slate-50/50 transition-colors border-slate-100 group"
              >
                {/* Employee name + department */}
                <TableCell className="py-4 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 group-hover:bg-white transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{req.employee_name}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{req.department}</p>
                    </div>
                  </div>
                </TableCell>

                {/* Requested asset type */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700 font-medium">{req.item_needed}</span>
                  </div>
                </TableCell>

                {/* Required date range */}
                <TableCell>
                  <div className="flex flex-col text-[10px] font-medium text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{req.start_date ? format(new Date(req.start_date), 'MMM d, yyyy') : 'N/A'} —</span>
                    </div>
                    <div className="pl-4">
                      <span>{req.end_date ? format(new Date(req.end_date), 'MMM d, yyyy') : 'N/A'}</span>
                    </div>
                  </div>
                </TableCell>

                {/* Priority badge – colour-coded: High=red, Medium=amber, Low=slate */}
                <TableCell>
                  <span className={cn(
                    "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border",
                    req.priority === 'High'   ? "text-red-600 border-red-100 bg-red-50"     :
                    req.priority === 'Medium' ? "text-amber-600 border-amber-100 bg-amber-50" :
                    "text-slate-500 border-slate-100 bg-slate-50"
                  )}>
                    {req.priority}
                  </span>
                </TableCell>

                {/* Status badge – colour-coded: Approved=emerald, Rejected=red, Pending=amber */}
                <TableCell>
                  <Badge variant="outline" className={cn(
                    "px-2 py-0.5 font-bold text-[10px] border shadow-none",
                    req.status === 'Approved' ? "text-emerald-600 border-emerald-100 bg-emerald-50" :
                    req.status === 'Rejected' ? "text-red-600 border-red-100 bg-red-50"         :
                    "text-amber-600 border-amber-100 bg-amber-50"
                  )}>
                    {req.status}
                  </Badge>
                </TableCell>

                {/* Conditional action column – only rendered when showActions=true */}
                {showActions && (
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      {req.status === 'Pending' ? (
                        <>
                          {/* Approve button – transitions request to Approved state */}
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 px-3 border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                            onClick={() => updateStatus(req.id, 'Approved')}
                            disabled={updatingId === req.id}
                          >
                            <Check className="w-3.5 h-3.5 mr-1" /> Approve
                          </Button>
                          {/* Reject button – transitions request to Rejected state */}
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 px-3 border-red-200 text-red-600 hover:bg-red-600 hover:text-white"
                            onClick={() => updateStatus(req.id, 'Rejected')}
                            disabled={updatingId === req.id}
                          >
                            <X className="w-3.5 h-3.5 mr-1" /> Reject
                          </Button>
                        </>
                      ) : (
                        /* Reset button – reverts Approved/Rejected back to Pending for re-review */
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-[10px] font-bold text-slate-400 hover:text-primary"
                          onClick={() => updateStatus(req.id, 'Pending')}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" /> Reset
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
