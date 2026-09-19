import { withAuth } from "next-auth/middleware";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const hasSecureCookie =
    req.cookies.has("__Secure-next-auth.session-token") ||
    req.cookies.has("__Secure-next-auth.session-token.0");

  const hasInsecureCookie =
    req.cookies.has("next-auth.session-token") ||
    req.cookies.has("next-auth.session-token.0");

  const isProduction =
    process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

  const cookieName = hasSecureCookie
    ? "__Secure-next-auth.session-token"
    : hasInsecureCookie
    ? "next-auth.session-token"
    : isProduction
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  return withAuth(
    function middleware(req) {
      const token = req.nextauth.token;
      const pathname = req.nextUrl.pathname;

      if (!token) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      const role = token.role as string;
      const status = token.status as string;

      // 1. Admin route protection
      if (pathname.startsWith("/admin")) {
        if (role !== "ADMIN") {
          if (status === "APPROVED") {
            return NextResponse.redirect(new URL("/employee/dashboard", req.url));
          } else if (status === "PENDING") {
            return NextResponse.redirect(new URL("/pending", req.url));
          } else {
            return NextResponse.redirect(new URL("/denied", req.url));
          }
        }
      }

      // 2. Employee route protection
      if (pathname.startsWith("/employee")) {
        if (status === "PENDING") {
          return NextResponse.redirect(new URL("/pending", req.url));
        } else if (status === "DENIED" || status === "REVOKED") {
          return NextResponse.redirect(new URL("/denied", req.url));
        }
      }

      return NextResponse.next();
    },
    {
      secret: process.env.NEXTAUTH_SECRET,
      cookies: {
        sessionToken: {
          name: cookieName,
        },
      },
      callbacks: {
        authorized: ({ token, req }) => {
          const pathname = req.nextUrl.pathname;
          if (pathname.startsWith("/api/auth")) return true;
          return !!token;
        },
      },
      pages: {
        signIn: "/",
      },
    }
  )(req as any, event);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/employee/:path*",
    "/pending",
    "/denied",
  ],
};

