import { createClient } from '@supabase/supabase-js';
import { QueryClient } from '@tanstack/react-query';

const supabaseUrl = 'https://cbtlnniotuvdfwydrmzm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNidGxubmlvdHV2ZGZ3eWRybXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NTkyODYsImV4cCI6MjA3MjAzNTI4Nn0.U5ipnkQr6aKHY4Oa6ct2ZaG5XtAv-XVV4W-ffUE2JJk';

// Create a global QueryClient that can be accessed via supabase
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 0 // Always consider data stale
    }
  }
});

// Extend the supabase client with the QueryClient and force online mode
export const supabase = Object.assign(
  createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    global: {
      // Force online-only mode
      fetch: (...args) => {
        console.log("Supabase fetch call:", args[0]);
        return fetch(...args);
      }
    }
  }),
  { queryClient }
);
