import { NextResponse } from "next/server";
import { createClient } from "../../utils/supabase/server";

export const dynamic = "force-dynamic"; // Forces Next.js to always execute dynamically on the server

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (!code) {
    console.error("CALLBACK ERROR: No code parameter found");
    return NextResponse.redirect(
      new URL("/login?error=no_code", requestUrl.origin),
      { status: 302 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    console.error("CALLBACK ERROR: Code exchange failed:", error?.message);
    return NextResponse.redirect(
      new URL("/login?error=auth_failed", requestUrl.origin),
      { status: 302 },
    );
  }

  // Create redirect response and apply strict headers to prevent 304 caching
  const redirectResponse = NextResponse.redirect(
    new URL(next, requestUrl.origin),
    {
      status: 302,
    },
  );

  redirectResponse.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );

  return redirectResponse;
}
