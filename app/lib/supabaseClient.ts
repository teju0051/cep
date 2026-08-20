import { createClient } from "@supabase/supabase-js";

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = "https://ooxgzjwtsxepzqtgfcjn.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9veGd6and0c3hlcHpxdGdmY2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNDU4ODIsImV4cCI6MjEwMjcyMTg4Mn0.OacSzNJ6rHfGf-TcXDXa1cAYYKECxDCEpvoCHfIfu4I";

export const supabase = createClient(supabaseUrl, supabaseKey);
