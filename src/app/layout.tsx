'use client';

/**
 * @fileoverview Root application layout component.
 *
 * Defines the top-level HTML shell shared by every page in the Next.js
 * application.  Responsibilities include:
 *
 *  - Injecting global CSS and Google Fonts (Inter, Plus Jakarta Sans).
 *  - Rendering the persistent {@link DashboardSidebar} that anchors all
 *    primary navigation.
 *  - Wrapping page content in Framer Motion's {@link AnimatePresence} to
 *    produce smooth fade/slide transitions on route changes.
 *  - Mounting the global {@link Toaster} overlay so toast notifications can
 *    be triggered from any component in the tree.
 *
 * Because this component uses `usePathname` (a Client-side hook), it is
 * marked `'use client'`.  In Next.js 13+ App Router projects it is safe to
 * mark the root layout as a Client Component when client-side interactivity
 * is required at the shell level.
 *
 * @module app/layout
 */

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { DashboardSidebar } from "@/components/layout/sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Root layout wrapper rendered by Next.js for every route in the application.
 *
 * Provides the persistent application shell (sidebar, fonts, global styles)
 * and animated page transitions.  All page components are injected via the
 * `children` prop by the Next.js router.
 *
 * @param props.children - The active page component tree rendered by the router.
 * @returns The full HTML document structure including head metadata and body layout.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Track the current pathname to key the AnimatePresence motion div,
  // ensuring the enter/exit animation plays on every distinct route change.
  const pathname = usePathname();

  return (
    <html lang="en">
      <head>
        <title>IT Asset Tracker | Enterprise Resource Management</title>
        <meta name="description" content="Professional IT asset tracking and request management system." />
        {/* Preconnect to Google Fonts CDN to reduce font loading latency */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-slate-50 text-slate-900 min-h-screen">
        <div className="flex">
          {/* Fixed left-hand navigation sidebar – hidden on mobile via CSS */}
          <DashboardSidebar />

          {/*
           * Main content area.
           * `lg:ml-64` offsets the content by the sidebar width on large screens.
           * `AnimatePresence mode="wait"` ensures the exit animation of the
           * outgoing page completes before the entering page renders.
           */}
          <main className="flex-1 lg:ml-64 relative min-h-screen">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="page-transition-wrapper p-6 lg:p-10 max-w-[1600px] mx-auto"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Global toast notification renderer – positioned via CSS in toaster component */}
        <Toaster />
      </body>
    </html>
  );
}
