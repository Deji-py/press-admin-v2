import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Define routes
  const publicRoutes = ["/", "/signup"];
  const authRoutes = [
    "/",
    "/signup",
    "/login",
    "/forgot-password",
    "/reset-password",
  ];
  const dashboardRoute = "/dashboard";
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // Handle unauthenticated users
  if (userError || !user) {
    if (isPublicRoute) {
      return supabaseResponse;
    }
    if (userError) {
      // console.error("Error fetching user:", userError.message);
    }
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Check if user is admin
  let isAdmin = false;
  try {
    const { data: adminData, error: adminError } = await supabase
      .from("admin")
      .select("*")
      .eq("user_id", user.id)
      .in("role", ["admin", "superadmin"])
      .single();

    if (adminError && adminError.code !== "PGRST116") {
      // console.error("Error fetching admin data:", adminError.message);
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    isAdmin = !!adminData;
  } catch (error) {
    // console.error("Unexpected error checking admin status:", error);
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Handle authenticated users
  if (isAdmin) {
    // Redirect admins from auth routes to dashboard
    if (isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = dashboardRoute;
      return NextResponse.redirect(url);
    }
  } else {
    // Log out non-admins trying to access home or dashboard routes
    if (pathname === "/" || isDashboardRoute) {
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch (error) {
        // console.error("Error during logout:", error);
      }
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Allow all other routes for authenticated users
  return supabaseResponse;
}
