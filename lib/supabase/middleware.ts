import { Database } from "@/types/database";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function redirectTo(path: string, request: NextRequest, from: NextResponse) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  const res = NextResponse.redirect(url);
  from.cookies.getAll().forEach((c) => res.cookies.set(c));
  return res;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database, "bounty">(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: "bounty" },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: nothing async between client creation and getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith("/auth");
  const isLogin = path === "/login";
  const isOnboarding = path === "/onboarding";

  if (!user) {
    if (isLogin || isAuthRoute) return supabaseResponse;
    return redirectTo("/login", request, supabaseResponse);
  }

  // signed in — is onboarding complete?
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    if (isOnboarding || isAuthRoute) return supabaseResponse;
    return redirectTo("/onboarding", request, supabaseResponse);
  }

  if (isLogin || isOnboarding) return redirectTo("/dashboard", request, supabaseResponse);

  return supabaseResponse;
}