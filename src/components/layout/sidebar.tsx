"use client";

/**
 * @fileoverview Application navigation sidebar component.
 *
 * Renders the fixed left-side navigation panel used across all pages of the
 * IT Asset Tracker.  The sidebar is persistent (always visible on large
 * screens) and provides primary route navigation between the four core
 * application areas: Dashboard, New Request, Administration, and Analytics.
 *
 * Visual design highlights:
 *  - Active route detection via `usePathname` for accurate link highlighting.
 *  - Framer Motion `layoutId` animation on the active indicator pill, creating
 *    a smooth spring-driven transition when navigating between routes.
 *  - Fully hidden on mobile via Tailwind's `hidden lg:flex` utility; a
 *    separate mobile navigation pattern should be implemented if needed.
 *
 * @module components/layout/sidebar
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, PlusCircle, ShieldCheck, BarChart3, Cpu } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Navigation item configuration.
 * Each entry maps a Lucide icon, a display label, and a Next.js route href.
 * Order determines the visual stacking order in the sidebar.
 */
const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",     href: "/"          },
  { icon: PlusCircle,      label: "New Request",   href: "/request"   },
  { icon: ShieldCheck,     label: "Administration",href: "/admin"     },
  { icon: BarChart3,       label: "Analytics",     href: "/analytics" },
];

/**
 * DashboardSidebar component.
 *
 * Renders the fixed application navigation sidebar with an animated active
 * state indicator.  The component uses `usePathname` to perform an exact
 * string match against each nav item's `href` to determine the active route.
 *
 * The `layoutId="sidebar-active"` on the motion indicator div allows Framer
 * Motion to animate the indicator between nav items as a shared layout
 * element, producing a fluid sliding effect without manual animation logic.
 *
 * @returns The aside element representing the full-height navigation panel.
 */
export function DashboardSidebar() {
  /** Current Next.js pathname used to determine the active navigation link. */
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 hidden lg:flex flex-col bg-white z-50 border-r border-slate-200">
      <div className="flex flex-col h-full p-6">
        {/* Application brand / logo lockup */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            IT Tracker
          </h1>
        </div>

        {/* Primary navigation links */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            /** Exact-match active check against the current pathname. */
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group font-semibold text-sm",
                  isActive 
                    ? "text-primary bg-primary/5" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600")} />
                <span>{item.label}</span>

                {/*
                 * Shared layout element that animates between active nav items.
                 * Only rendered for the currently active route; Framer Motion
                 * handles the spring interpolation between positions automatically.
                 */}
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute right-0 w-1 h-6 bg-primary rounded-l-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
