/**
 * @fileoverview Mobile viewport detection hook.
 *
 * Provides a lightweight, SSR-safe hook that reactively tracks whether the
 * current viewport width falls below the mobile breakpoint threshold.  Uses
 * the `matchMedia` API for efficient CSS media query matching rather than
 * polling `window.innerWidth` on a resize observer, reducing CPU overhead
 * during scroll and resize events.
 *
 * @module hooks/use-mobile
 */

import * as React from "react"

/** The viewport width (in pixels) below which the device is considered mobile. */
const MOBILE_BREAKPOINT = 768

/**
 * Hook that returns `true` when the viewport width is below the mobile
 * breakpoint threshold ({@link MOBILE_BREAKPOINT} px).
 *
 * Subscribes to `MediaQueryList` change events so the returned boolean
 * updates reactively on every viewport resize without requiring a polling
 * interval.  The event listener is automatically removed on unmount.
 *
 * Initial state is `undefined` to allow SSR renders to proceed without
 * accessing browser-only APIs; it resolves to a boolean on the first effect
 * run in the browser.
 *
 * @returns `true` when the viewport is narrower than the mobile breakpoint,
 *   `false` otherwise.  Returns `false` during SSR (before hydration).
 *
 * @example
 * function NavBar() {
 *   const isMobile = useIsMobile();
 *   return isMobile ? <HamburgerMenu /> : <DesktopNav />;
 * }
 */
export function useIsMobile() {
  /**
   * Initialised as `undefined` so server-rendered HTML is not incorrectly
   * hydrated with a stale boolean before the browser report runs.
   */
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Create a MediaQueryList for the mobile breakpoint.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Handler updates state on every viewport width change that crosses the threshold.
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    mql.addEventListener("change", onChange)

    // Set the initial value synchronously after attaching the listener to avoid
    // a flash of incorrect layout between mount and the first change event.
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // Cleanup: remove the listener when the component unmounts.
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Coerce `undefined` to `false` for safe boolean usage in JSX conditionals.
  return !!isMobile
}
