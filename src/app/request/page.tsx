"use client";

/**
 * @fileoverview Asset Request Portal page ("/request" route).
 *
 * Entry point for employees who need to submit a new IT asset request.
 * The page provides contextual UI chrome (icon, title, subtitle) and renders
 * the {@link RequestForm} component which handles all form state, validation,
 * and Supabase persistence.
 *
 * The animated icon entrance uses Framer Motion's spring physics to create a
 * polished "pop-in" effect that draws the user's attention to the form context
 * without being distracting.
 *
 * @module app/request/page
 */

import { RequestForm } from "@/components/requests/request-form";
import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";

/**
 * Asset Request Portal page component.
 *
 * Wraps the {@link RequestForm} in a centred, constrained-width layout with
 * an animated header section.  The page is intentionally minimal to keep the
 * employee's focus on the form itself.
 *
 * @returns The request portal page with an animated page header and the
 *   asset request submission form.
 */
export default function RequestPage() {
  return (
    <div className="max-w-3xl mx-auto py-10">
      {/* ------------------------------------------------------------------ */}
      {/* Animated Page Header                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="text-center mb-12">
        {/*
         * Icon container animates from scale 0 → 1 on mount.
         * The spring-based default easing gives a natural elastic bounce
         * without needing explicit spring configuration.
         */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/30 neon-glow-primary"
        >
          <ClipboardList className="text-primary w-8 h-8" />
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Asset Request Portal</h1>
        <p className="text-slate-400 text-lg">
          Please provide detailed information regarding your hardware or software requirements
        </p>
      </div>
      
      {/* Main form component – handles all validation, state, and Supabase writes */}
      <RequestForm />
    </div>
  );
}
