import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
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
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/employee/:path*",
    "/pending",
    "/denied",
  ],
};
