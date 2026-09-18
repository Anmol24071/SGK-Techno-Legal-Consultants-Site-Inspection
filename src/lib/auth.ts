import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import { sendAccessEmail } from "./email";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "705165472131-bhls3dmdfs7n4jqgmsgp4pmjvvc1s5s7.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "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";
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "sgk_techno_legal_super_secret_session_key_2026";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "tarachandanianil@gmail.com").trim().toLowerCase();
const CANONICAL_URL = "https://sgk-techno-legal-consultants-si.vercel.app";

if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes("localhost")) {
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    process.env.NEXTAUTH_URL = CANONICAL_URL;
  } else {
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      checks: ["state"],
      httpOptions: {
        timeout: 15000,
      },
    }),
  ],
  useSecureCookies: process.env.NODE_ENV === "production" || process.env.VERCEL ? true : false,
  debug: true,
  logger: {
    error(code, metadata) {
      console.error(`[NEXTAUTH ERROR LOG] ${code}`, metadata);
    },
    warn(code) {
      console.warn(`[NEXTAUTH WARN LOG] ${code}`);
    },
    debug(code, metadata) {
      console.log(`[NEXTAUTH DEBUG LOG] ${code}`, metadata);
    },
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log(`[AUTH DIAGNOSTIC] redirect callback - url: ${url}, baseUrl: ${baseUrl}`);
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async signIn({ user, account, profile }) {
      console.log(`[AUTH DIAGNOSTIC] signIn callback - email: ${user?.email}, provider: ${account?.provider}`);
      if (account?.provider === "google") {
        if (!user.email) return false;

        const adminEmail = ADMIN_EMAIL;
        const isAdmin = user.email.trim().toLowerCase() === adminEmail;

        try {
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email.toLowerCase() },
          });

          if (!dbUser) {
            // First time sign-in: create user record
            dbUser = await prisma.user.create({
              data: {
                googleId: account.providerAccountId,
                name: user.name || "Site Inspector",
                email: user.email.toLowerCase(),
                image: user.image || null,
                role: isAdmin ? "ADMIN" : "EMPLOYEE",
                status: isAdmin ? "APPROVED" : "PENDING",
              },
            });

            if (!isAdmin) {
              // Create Access Request record
              try {
                await prisma.accessRequest.create({
                  data: {
                    userId: dbUser.id,
                    name: dbUser.name,
                    email: dbUser.email,
                    image: dbUser.image,
                    googleId: account.providerAccountId,
                    status: "PENDING",
                  },
                });
              } catch (arErr) {
                console.error("AccessRequest creation error:", arErr);
              }

              // Non-blocking background email notifications
              sendAccessEmail({
                to: dbUser.email,
                name: dbUser.name,
                type: "PROFILE_SHARED",
              }).catch((emailErr) => console.error("Email dispatch error:", emailErr));

              sendAccessEmail({
                to: adminEmail,
                name: dbUser.name,
                type: "NEW_REQUEST",
              }).catch((emailErr) => console.error("Email dispatch error:", emailErr));
            }
          } else {
            // Existing user sign-in update
            const updatedRole = isAdmin ? "ADMIN" : dbUser.role;
            const updatedStatus = isAdmin ? "APPROVED" : dbUser.status;

            try {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                  googleId: account.providerAccountId,
                  name: user.name || dbUser.name,
                  image: user.image || dbUser.image,
                  role: updatedRole,
                  status: updatedStatus,
                  lastLoginAt: new Date(),
                },
              });
            } catch (updErr) {
              console.error("User update error:", updErr);
            }
          }
        } catch (dbErr) {
          console.error("Prisma Database Error in signIn callback (non-fatal):", dbErr);
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      console.log(`[AUTH DIAGNOSTIC] jwt callback - token email: ${token?.email}`);
      if (user) {
        token.id = user.id;
      }
      if (token.email) {
        const adminEmail = ADMIN_EMAIL;
        const isAdmin = token.email.trim().toLowerCase() === adminEmail;

        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email.toLowerCase() },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.role = isAdmin ? "ADMIN" : dbUser.role;
            token.status = isAdmin ? "APPROVED" : dbUser.status;
            token.name = dbUser.name;
            token.picture = dbUser.image || undefined;
          } else {
            token.role = isAdmin ? "ADMIN" : "EMPLOYEE";
            token.status = isAdmin ? "APPROVED" : "PENDING";
          }
        } catch (dbErr) {
          console.error("Prisma Database Error in jwt callback (fallback enabled):", dbErr);
          token.role = isAdmin ? "ADMIN" : "EMPLOYEE";
          token.status = isAdmin ? "APPROVED" : "PENDING";
        }
      }
      return token;
    },
    async session({ session, token }) {
      console.log(`[AUTH DIAGNOSTIC] session callback - user email: ${session?.user?.email}, role: ${token?.role}, status: ${token?.status}`);
      if (session.user) {
        (session.user as any).id = token.id || "temp-id";
        (session.user as any).role = token.role || "EMPLOYEE";
        (session.user as any).status = token.status || "PENDING";
      }
      return session;
    },
  },

  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: NEXTAUTH_SECRET,
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: "ADMIN" | "EMPLOYEE";
    status: "PENDING" | "APPROVED" | "DENIED" | "REVOKED";
  };
}
