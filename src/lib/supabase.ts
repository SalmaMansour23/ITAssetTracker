/**
 * @fileoverview Supabase client singleton.
 *
 * Initialises and exports a single Supabase JavaScript client instance used
 * throughout the application for all database operations (queries, mutations,
 * and Realtime subscriptions against the `asset_requests` table).
 *
 * Credentials are read from Next.js public environment variables so they are
 * available in the browser bundle.  Fallback placeholder strings prevent a
 * hard crash during cold-start if the environment is not yet configured,
 * allowing the development server to boot and surface helpful error messages
 * in component boundaries instead of a blank page.
 *
 * Required environment variables (`.env.local`):
 * ```
 * NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
 * NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
 * ```
 *
 * @module lib/supabase
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Supabase project URL sourced from the environment.
 * Falls back to a placeholder to prevent an unhandled exception during
 * development when environment variables have not yet been configured.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';

/**
 * Supabase anonymous public API key sourced from the environment.
 * The anon key is safe to expose in the browser as Row Level Security (RLS)
 * policies on the Supabase project enforce actual access control.
 */
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

/**
 * Application-wide Supabase client instance.
 *
 * Import this constant in any module that needs to interact with the
 * Supabase database or subscribe to Realtime events.
 *
 * @example
 * import { supabase } from '@/lib/supabase';
 * const { data } = await supabase.from('asset_requests').select('*');
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
