/**
 * @fileoverview General-purpose utility functions.
 *
 * Houses shared helper functions used across the component library and
 * application code.  Currently exports `cn`, the primary class-name merging
 * utility, but may expand to include additional pure helpers (e.g. formatters,
 * validators) as the codebase grows.
 *
 * @module lib/utils
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges a list of class name values into a single, deduplicated Tailwind CSS
 * class string.
 *
 * Combines `clsx` (for conditional class composition) with `tailwind-merge`
 * (for Tailwind-aware conflict resolution).  This ensures that when conflicting
 * utilities are provided (e.g. `'p-4'` and `'p-6'`), the last one wins rather
 * than both being included in the output string.
 *
 * @param inputs - Any number of class values: strings, arrays, or conditional
 *   objects accepted by `clsx`.
 * @returns A single merged and deduplicated class name string.
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-primary', 'px-6')
 * // => 'py-2 bg-primary px-6'  (px-4 is overridden by px-6)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
