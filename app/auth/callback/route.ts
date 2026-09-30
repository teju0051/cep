import { NextResponse } from "next/server";
import { createClient } from "../../utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  const supabase = await createClient();

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }

    // Log error for debugging if needed, but don't fail immediately
    console.error("Auth callback code exchange note:", error?.message);
  }

  // Fallback: If the code was already used (e.g. page refresh) or token exists, check active session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  // If all checks fail, redirect back to login with a clean error
  return NextResponse.redirect(
    new URL("/login?error=auth_failed", requestUrl.origin),
  );
}
