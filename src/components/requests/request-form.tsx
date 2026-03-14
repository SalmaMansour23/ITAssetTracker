
"use client";

/**
 * @fileoverview IT Asset Request Form component.
 *
 * Provides a multi-field, validated form that allows employees to submit new
 * IT asset requests to the organisation's procurement workflow.  On successful
 * submission, the request is persisted to the Supabase `asset_requests` table
 * with an initial status of `'Pending'`, making it immediately visible in the
 * admin tracking table.
 *
 * Form fields:
 *  - Full Name & Department  (employee identification)
 *  - Item Needed             (asset category via dropdown)
 *  - Priority Level          (Low / Medium / High toggle)
 *  - Required From / To      (date range for asset usage)
 *  - Business Justification  (free-text reason for the request)
 *
 * Validation is performed client-side before the Supabase insert to reduce
 * unnecessary API calls.  All required fields are checked and a destructive
 * toast is shown for any missing values.
 *
 * Post-submission, the form transitions to a branded confirmation screen,
 * addressing the user by first name and displaying the requested item name.
 * A "Submit Another Request" button resets the form back to its initial state.
 *
 * @module components/requests/request-form
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, Send, FileText, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/**
 * RequestForm component.
 *
 * Renders a controlled multi-field form for IT asset requests.  Handles all
 * form state, client-side validation, async Supabase persistence, and
 * post-submission confirmation with animated transitions.
 *
 * @returns The interactive asset request form card, or a success confirmation
 *   card once the submission has been successfully persisted.
 */
export function RequestForm() {
  /** True while the Supabase insert is in-flight; disables the submit button. */
  const [loading, setLoading] = useState(false);

  /**
   * True after a successful Supabase insert; toggles the view from the form
   * to the confirmation/success screen.
   */
  const [submitted, setSubmitted] = useState(false);

  const { toast } = useToast();

  /**
   * Controlled form state object.
   * All fields are initialised to empty strings except `priority` (defaulting
   * to Medium) and `request_date` (auto-populated with today's ISO date).
   */
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    item_needed: "",
    priority: "Medium",
    reason: "",
    start_date: "",
    end_date: "",
    request_date: new Date().toISOString().split('T')[0]  // ISO date string: YYYY-MM-DD
  });

  /**
   * Handles form submission: validates required fields, inserts the request
   * into Supabase with a `'Pending'` status, and transitions to the success
   * screen on completion.
   *
   * @param e - The React form submit event (default is prevented to avoid
   *   full-page reload).
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ── Client-side validation ──────────────────────────────────────────────
    // All six required fields must be non-empty before we invoke the database.
    if (!formData.name || !formData.department || !formData.item_needed || !formData.reason || !formData.start_date || !formData.end_date) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please fill in all mandatory fields before submitting."
      });
      return;
    }

    setLoading(true);
    
    // ── Supabase insert ────────────────────────────────────────────────────
    // Maps form state fields to the database column schema.  Status is always
    // set to 'Pending' on creation; admins transition it via the admin table.
    const { error } = await supabase
      .from('asset_requests')
      .insert([{
        employee_name: formData.name,
        department:    formData.department,
        item_needed:   formData.item_needed,
        priority:      formData.priority,
        reason:        formData.reason,
        start_date:    formData.start_date,
        end_date:      formData.end_date,
        request_date:  formData.request_date,
        status:        'Pending'
      }]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Database Error",
        description: error.message
      });
    } else {
      // Transition to the success confirmation screen.
      setSubmitted(true);
      toast({
        title: "Request Submitted",
        description: "Your IT asset request has been successfully logged."
      });
    }
    setLoading(false);
  };

  // ── Post-submission confirmation screen ─────────────────────────────────
  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="bg-white border-slate-200 shadow-xl p-12 text-center max-w-lg mx-auto mt-10">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          {/* Personalised confirmation message using the submitter's first name */}
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You, {formData.name.split(' ')[0]}</h2>
          <p className="text-slate-500 mb-8">
            Your request for {formData.item_needed} has been received and is being processed by the IT department.
          </p>
          {/* Reset button re-initialises the form for a follow-up submission */}
          <Button onClick={() => setSubmitted(false)} variant="outline" className="w-full">
            Submit Another Request
          </Button>
        </Card>
      </motion.div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <Card className="bg-white border-slate-200 shadow-lg overflow-hidden">
      <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <FileText className="w-5 h-5" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-900">Request Details</CardTitle>
        </div>
        <p className="text-slate-500 text-sm">Fill out the information below to request a new hardware or software asset.</p>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Row 1: Employee identification ─────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-semibold">Full Name *</Label>
              <Input 
                id="name"
                placeholder="e.g. Michael Scott" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="border-slate-200 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="text-slate-700 font-semibold">Department *</Label>
              <Input 
                id="department"
                placeholder="e.g. Regional Management" 
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="border-slate-200"
              />
            </div>
          </div>

          {/* ── Row 2: Asset type and priority ────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="item" className="text-slate-700 font-semibold">Item Needed *</Label>
              <Select onValueChange={(v) => setFormData({...formData, item_needed: v})}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laptop">Laptop / Workstation</SelectItem>
                  <SelectItem value="Software">Software License</SelectItem>
                  <SelectItem value="Hardware">Hardware / Peripheral</SelectItem>
                  <SelectItem value="Mobile">Mobile Device</SelectItem>
                  <SelectItem value="Other">Other Equipment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Priority Level *</Label>
              {/*
               * Segmented button group for priority selection.
               * Using `type="button"` prevents accidental form submission when
               * clicking a priority option inside the form element.
               */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
                {["Low", "Medium", "High"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={cn(
                      "flex-1 py-2 text-xs font-bold rounded-md transition-all",
                      formData.priority === p 
                        ? "bg-white text-primary shadow-sm" 
                        : "text-slate-500 hover:text-slate-700"
                    )}
                    onClick={() => setFormData({...formData, priority: p})}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Row 3: Required date range ───────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-slate-700 font-semibold">Required From *</Label>
              <div className="relative">
                {/* Calendar icon is purely decorative – `pointer-events-none` ensures it doesn't interfere with input focus */}
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input 
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  className="pl-10 border-slate-200 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-slate-700 font-semibold">Required To *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input 
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  className="pl-10 border-slate-200 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* ── Row 4: Business justification (free text) ────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-slate-700 font-semibold">Business Justification *</Label>
            <Textarea 
              id="reason"
              className="min-h-[120px] border-slate-200"
              placeholder="Please explain why this asset is required for your role..." 
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
            />
          </div>

          {/* Submit button – shows a spinner and "Processing..." label during async write */}
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full py-6 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-lg transition-transform active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Submit Request <Send className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
